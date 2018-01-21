/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import moment from 'moment';
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DateTimePicker from 'components/DateTimePicker';
import CircularProgress from 'material-ui/CircularProgress';
import Checkbox from 'material-ui/Checkbox';
import ReactTooltip from 'react-tooltip'

import Dialog from 'material-ui/Dialog';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import BigNumber from 'bignumber.js';

import isAddress from 'utils/validateAddress';
import EbetsJson from 'build/contracts/Ebets.json';
import BetJson from 'build/contracts/Bet.json';
import StaticArbiterJson from 'build/contracts/StaticArbiter.json'

import betFields from 'utils/betFields';
import versusIcon from 'assets/imgs/icons/vs.png';

import Address from 'components/Address';
import Arbiters from 'components/Arbiters';
import ArbiterForm from 'components/ArbiterForm';
import {getParsedCategories} from 'utils/ebetsCategories';
import { deployContract, createBet } from 'utils/contractHelpers';
import Web3Service from 'services/Web3Service';

//TODO: put this in a configruation file
const ARBITER_DEADLINE_PERIOD = 7;
const SELF_DESTRUCT_DEADLINE_PERIOD = 14;
const TAX = 10;

class BetForm extends Component {
  static tooltips = {
    privateBet : "No fees, not listed in Ebets",
    arbiters: "Arbiters decide bet's outcome",
    arbiterMember: "Member account"
  };
  static gridListStyle = {
    marginTop:10
  };
  static gridRootStyle = {
    display: 'flex',
    marginLeft: 50,
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  };
  constructor(props) {
    super(props)
    this.state = {
      arbiterName: '', // Get from new arbiter
      customArbiterAddress: null,
      toggleNewArbiter: false,
      alert: {
        open: false,
        type: 'info',
        message: ''
      },
      transactionInProcess: false,
      ...betFields
    }
  }

  validateDateRange = (selectedField, selectedDate, limitField, limitDate) => {
    if (selectedDate < limitDate) {
      this.setState({ alert: { type: 'danger', message: `Error: ${selectedField} can't be greater than ${limitField}`, open: true } });
      return false;
    }
    return true;
  }

  initializeTimestamps = () => {
    const currentDate = moment().add(2, 'hour').toDate();
    this.setState({
      timestampMatchBegin: currentDate,
      timestampMatchEnd: moment(currentDate).add(1, 'day').toDate(),
      timestampArbiterDeadline: moment(currentDate).add(ARBITER_DEADLINE_PERIOD, 'days').toDate(),
      timestampSelfDestructDeadline: moment(currentDate).add(SELF_DESTRUCT_DEADLINE_PERIOD, 'days').toDate()
    });
  }

  menuItem(all) {
    return all.map((name) => {
      return (
        <MenuItem
          key={name.key}
          insetChildren={true}
          value={name.key}
          primaryText={name}
        />
    )});
  }

  handleArbiterChange = (inputText) => {
    var newArbiterState = {
      arbiterErrorMessage: null,
      selectedArbiter: inputText
    };
    if(!isAddress(inputText)) {
      newArbiterState = {
        arbiterErrorMessage: 'Invalid address'
      };
    }
    this.setState(newArbiterState);
  }

  handleArbiterSubmit = (selectedItem, index) => {
    if (index !== -1) {
      this.setState({ selectedArbiter: selectedItem.value });
    }
  }

  handleCategoryChange = (event, index, value) => {
    this.setState({ category: value });
  }

  handleOnChange = (event) => {
    const target = event.target;
    const value =  target.value;
    const name = target.name;

    this.setState({ [name]: value });
  };

  handleChangeTimestampMatchBegin = (date) => {
    this.setState({ timestampMatchBegin: new moment(date) });
  };

  handleChangeTimestampMatchEnd= (date) => {
    if (this.validateDateRange("End date", date, "Start date", this.state.timestampMatchBegin)) {
      this.setState({
        timestampMatchEnd: new moment(date).toDate(),
        timestampArbiterDeadline: new moment(date).add(ARBITER_DEADLINE_PERIOD, 'days').toDate(),
        timestampSelfDestructDeadline: new moment(date).add(SELF_DESTRUCT_DEADLINE_PERIOD, 'days').toDate()
      });
    }
  };

  handleChangeTimestampArbiterDeadline = (date) => {
    if (this.validateDateRange("Arbiter deadline date", date, "End date", this.state.timestampMatchEnd)) {
      this.setState({ timestampArbiterDeadline: date });
    }
  };

  handleChangeTimestampSelfDestructDeadline = (date) => {
    if (this.validateDateRange("Self destruction deadline date", date, "Arbiter deadline date", this.state.timestampArbiterDeadline)) {
      this.setState({ timestampSelfDestructDeadline: date });
    }
  };

  handleOnSubmit = event => {
    event.preventDefault();
    // TODO: Improve this
    if(!isAddress(this.state.selectedArbiter)) {
      this.setState({ alert: { type: 'danger', message: `Error: Invalid Arbiter Address ${this.state.selectedArbiter}`, open: true } });
    }
    // TODO: handle form validations
    if(this.state.isPrivate) {
      this.createPrivateBetContract()
    } else {
      this.createBetContract()
    }
  }

  handleAlert = () => {
    this.setState((prevState) => ({
      alert: {
        open: !prevState.alert.open
      }
    }));
  };

  componentWillMount() {
    this.setState({ isPrivate: false });
    this.initializeTimestamps();
  }

  normalizedTimestamps() {
    return [
      new BigNumber(moment(this.state.timestampMatchBegin).unix()),
      new BigNumber(moment(this.state.timestampMatchEnd).unix()),
      new BigNumber(moment(this.state.timestampArbiterDeadline).unix()),
      new BigNumber(moment(this.state.timestampSelfDestructDeadline).unix())
    ];
  }

  async createPrivateBetContract() {
    const timestamps = this.normalizedTimestamps();
    const { contract, gas } = await deployContract(BetJson, [
      this.state.selectedArbiter,
      this.state.team0Name,
      this.state.team1Name,
      timestamps,
      TAX
   ], Web3Service.selectedAccount)
   contract.send({ gas })
    .once('transactionHash', (txHash) => {
     this.setState({ alert: { type: 'info', message: `Created transaction with hash: ${txHash}\
      Waiting for confirmation`, open: true }, transactionInProcess: true });
    })
    .once('receipt', (receipt) => {
      this.setState({ alert: { type: 'info', message: `Got receipt,\
        contract address: ${receipt.contractAddress}`, open: true }, transactionInProcess: true });
      })
    .once('error', (error) => {
      this.setState({ alert: { type: 'danger', message: `Error: ${error.message}\
    `, open: true }, transactionInProcess: true });
    })
    .then(receipt => {
      this.setState({ transactionInProcess: false });
      this.props.router.push('/category/all_bets');
    });
  }

  async createBetContract() {
    const timestamps = this.normalizedTimestamps();

    const { contract, gas } = await createBet(EbetsJson, [
      this.state.selectedArbiter,
      this.state.team0Name,
      this.state.team1Name,
      this.state.category,
      timestamps
    ], Web3Service.selectedAccount, Web3Service.networkId)
    contract.send({ gas })
      .once('transactionHash', (txHash) => {
        this.setState({ alert: { type: 'info', message: `Created transaction with hash: ${txHash}\
        Waiting for confirmation`, open: true }, transactionInProcess: true });
      })
      .once('error', (error) => {
        this.setState({ alert: { type: 'danger', message: `Error: ${error.message}\
        `, open: true }, transactionInProcess: true });
      })
      .then(receipt => {
        this.setState({ transactionInProcess: false });
        this.props.router.push('/bet/' + receipt.events.createdBet.returnValues['0']);
      })
  }

  async handleCreateStaticArbiterContract(arbiterName, members) {
    //create contract
    const { contract, gas } = await deployContract(StaticArbiterJson, [
      arbiterName,
      members
    ], Web3Service.selectedAccount);

    contract.send({ gas })
      .once('transactionHash', (txHash) => {
        this.setState({ alert: { type: 'info', message: `Created transaction with hash: ${txHash} \
        Waiting for confirmation`, open: true }, transactionInProcess: true });
      })
      .once('receipt', (receipt) => {
        this.setState({ alert: { type: 'info', message: `Got receipt, \
        please copy the following contract address: ${receipt.contractAddress} \
        and use it as your arbiter. We will not store it!`, open: true }, transactionInProcess: true });
      })
      .once('error', (error) => {
        this.setState({ alert: { type: 'danger', message: `Error: ${error.message}\
        `, open: true }, transactionInProcess: true });
      })
      .then(arbiterContract => {
        this.setState({
          transactionInProcess: false,
          customArbiterAddress: arbiterContract.options.address,
          selectedArbiter: arbiterContract.options.address
        });
        return arbiterContract.methods.name().call();
      })
      .then(name => {
        this.setState({
          arbiterName: name
        })
        this.toggleNewArbiterForm();
      });
  }

  updatePrivateBet = (event, value) => {
    this.setState({ isPrivate: value })
  }

  toggleNewArbiterForm = () => {
    this.setState({toggleNewArbiter: !this.state.toggleNewArbiter});
  }

  render() {
    let ourArbiters = Arbiters.arbiters(Web3Service.networkId);
    if (this.state.customArbiterAddress) {
      ourArbiters.push({
        key: (
          Address.getArbiterMenuList(this.state.customArbiterAddress,
            (this.state.arbiterName === '') ?
            this.state.customArbiterAddress.substr(0, 10) + '...' :
            this.state.arbiterName, 0)
        ),
        value: this.state.customArbiterAddress
      })
    }

    if (this.state.alert.type && this.state.alert.message) {
      // TODO apply layouts
      // TODO: fix this
      const actions = [
        <RaisedButton key='cancel'
          label='OK'
          primary={false}
          onClick={this.handleAlert}
        />,
      ];
      var classString = 'bg-' + this.state.alert.type;
      var status = <div id="status" className={classString}>
                     <Dialog
                      modal={true}
                      actions={actions}
                      open={this.state.alert.open}
                     >
                      {this.state.alert.message}
                      <br/>
                      <center>
                      { (this.state.transactionInProcess) ?
                        <CircularProgress size={50} thickness={4} /> :
                        null
                      }
                      </center>
                     </Dialog>
                   </div>
     }

    return (
      <div style={BetForm.gridRootStyle}>
        {status}
        <div>
          <form onSubmit={this.handleOnSubmit} >
            <div>
              <GridList
                style={BetForm.gridListStyle}
                cellHeight={'auto'}
                cols={3}
              >
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team0Name"
                    value={this.state.team0Name}
                    floatingLabelText="Team Name"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile
                  style={{width: 54, height: 54, marginLeft: 'auto', marginRight: 'auto'}}
                >
                <img src={versusIcon} />
                </GridTile>
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team1Name"
                    value={this.state.team1Name}
                    floatingLabelText="Team Name"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
              </GridList>
              <GridList
                style={{flexWrap: 'nowrap', marginTop: '10px', ...BetForm.gridListStyle}}
                cellHeight={'auto'}
              >
                <GridTile>
                  <SelectField
                    autoWidth={true}
                    floatingLabelText="Category"
                    value={this.state.category}
                    onChange={this.handleCategoryChange}
                  >
                    {this.menuItem(getParsedCategories(), this.state.category)}
                  </SelectField>
                </GridTile>
                <GridTile>
                  <AutoComplete
                    textFieldStyle={{width: 380}}
                    style={{width: 380}}
                    floatingLabelText="Arbiter: decide the bet's outcome"
                    filter={(searchText, key, v) => 
                      (v.key.props.primaryText.toLowerCase().indexOf(searchText) !== -1)}
                    openOnFocus={true}
                    dataSource={ourArbiters}
                    dataSourceConfig={{ text: 'value', value: 'key' }}
                    onNewRequest={this.handleArbiterSubmit}
                    onUpdateInput={this.handleArbiterChange}
                    errorText={this.state.arbiterErrorMessage}
                  />
                </GridTile>
                <GridTile>
                  <DateTimePicker
                    autoOk={true}
                    floatingLabelText="Starts at"
                    defaultDate={this.state.timestampMatchBegin}
                    onChange={this.handleChangeTimestampMatchBegin}
                  />
                </GridTile>
                <GridTile>
                  <DateTimePicker
                    autoOk={true}
                    floatingLabelText="Ends at"
                    defaultDate={this.state.timestampMatchEnd}
                    onChange={this.handleChangeTimestampMatchEnd}
                  />
                </GridTile>
              </GridList>
              <Card>
                <CardHeader
                  title="Advanced options"
                  actAsExpander={true}
                  showExpandableButton={true}
                />
                <CardText expandable={true}>
                    <GridList
                      style={{flexWrap: 'nowrap'}}
                      cellHeight={'auto'}
                    >
                    <GridTile>
                      <DateTimePicker
                        autoOk={true}
                        floatingLabelText="Arbiter deadline"
                        defaultDate={this.state.timestampArbiterDeadline}
                        onChange={this.handleChangeTimestampArbiterDeadline}
                      />
                    </GridTile>
                    <GridTile>
                      <DateTimePicker
                        autoOk={true}
                        floatingLabelText="Self Destruction deadline"
                        defaultDate={this.state.timestampSelfDestructDeadline}
                        onChange={this.handleChangeTimestampSelfDestructDeadline}
                      />
                    </GridTile>
                  </GridList>
                </CardText>
              </Card><br />
            </div>
            <GridList
              style={BetForm.gridListStyle}
              cellHeight={'auto'}
              cols={3}
            >
              <GridTile>
                <Checkbox
                  label="Private Bet"
                  data-tip={BetForm.tooltips.privateBet}
                  onCheck={this.updatePrivateBet.bind(this)}
                />

              </GridTile>
              <Checkbox
                  label="Create Custom Arbiter"
                  data-tip={BetForm.tooltips.arbiters}
                  onCheck={this.toggleNewArbiterForm}
                />
              <GridTile style={{ float: 'right' }}>
                <RaisedButton type="submit" label="Create Bet" primary />
              </GridTile>
            </GridList>
          </form>
          { this.state.toggleNewArbiter &&
            <ArbiterForm createStaticArbiterContract={this.handleCreateStaticArbiterContract.bind(this)} />
          }
        </div>
         <ReactTooltip place="top" offset={{'right': 20}} type="dark" effect="float"/>
      </div>
    )
  }
}

export default BetForm;
