import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import getWeb3 from 'utils/getWeb3';
import EbetsArbiters from 'utils/ebetsArbiters';
import EbetsJson from 'build/contracts/ebets.json';

import betFields from 'components/betFields';
import versusIcon from 'assets/imgs/icons/vs.png';
import 'assets/stylesheets/BetForm.css'

const ARBITER_DEADLINE_PERIOD = 7
const SELF_DESTRUCT_DEADLINE_PERIOD = 14
const ARBITER_ADDRESSES = EbetsArbiters.addresses();
// TODO Get all categories
const CATEGORIES = ["E-Sports", "UFC"];

class BetForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      alert: {
        open: false,
        type: 'info',
        message: ''
      },
      ...betFields,
      arbiterAddress: "",
      web3: null
    }
  }

  initializeTimestamps = () => {
    const currentDate = moment().toDate();
    this.setState({
      timestampMatchBegin: currentDate,
      timestampMatchEnd: moment(currentDate).add(1, 'day').toDate(),
      timestampArbiterDeadline: moment(currentDate).add(ARBITER_DEADLINE_PERIOD, 'days').toDate(),
      timestampSelfDestructDeadline: moment(currentDate).add(SELF_DESTRUCT_DEADLINE_PERIOD, 'days').toDate()
    });
  }

  menuItem(all, selected) {
    return all.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={_.isEmpty(selected) && selected.indexOf(name) >= 0}
        value={name}
        primaryText={name}
      />
    ));
  }

  handleArbiterAddressChange = (event, index, value) => {
    // TODO: handle optional textfield input
    this.setState({ arbiterAddress: value });
  }

  handleCategoryChange = (event, index, value) => {
    this.setState({ category: value });
  }

  handleOnChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  };

  handleChangeTimestampMatchBegin = (event, date) => {
    this.setState({ timestampMatchBegin: date });
  };

  handleChangeTimestampMatchEnd= (event, date) => {
    this.setState({
      timestampMatchEnd: date,
      timestampArbiterDeadline: moment(date).add(ARBITER_DEADLINE_PERIOD, 'days').toDate(),
      timestampSelfDestructDeadline: moment(date).add(SELF_DESTRUCT_DEADLINE_PERIOD, 'days').toDate(),
    });
  };

  handleChangeTimestampArbiterDeadline = (event, date) => {
    this.setState({ timestampArbiterDeadline: date });
  };

  handleChangeTimestampSelfDestructDeadline = (event, date) => {
    this.setState({ timestampSelfDestructDeadline: date });
  };

  handleOnSubmit = event => {
    event.preventDefault();
    // TODO: handle form validations
    this.createContract()
  }

  handleAlert = () => {
    this.setState((prevState, props) => ({
      alert: {
        open: !prevState.alert.open
      }
    }));
  };

  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
    })
    .catch(() => {
      console.log('Error finding web3.');
    })

    this.initializeTimestamps();
  }

  createContract() {
    const contract = require('truffle-contract');
    const ebetsContract = contract(EbetsJson);
    ebetsContract.setProvider(this.state.web3.currentProvider);

    //create contract
    ebetsContract.deployed().then(instance => {

      const timestamps = [
        moment(this.state.timestampMatchBegin).unix(),
        moment(this.state.timestampMatchEnd).unix(),
        moment(this.state.timestampArbiterDeadline).unix(),
        moment(this.state.timestampSelfDestructDeadline).unix()
      ];
      console.log(this.state)
      let createdBet = instance.createBet(
        this.state.arbiterAddresses,
        this.state.team_0_title,
        this.state.team_1_title,
        this.state.category,
        timestamps,
        /* TODO: accounts[0] can be changed by the user,
         * There should be a way so when the user changes, this is updated too.
         */
        {from: this.state.web3.eth.accounts[0]}
        );
      return createdBet;
    })
    .then(response => {
      console.log(response);
      this.setState({ alert: { type: 'success', message: 'Bet created successfully', open: true } });
    })
    .catch((error) => {
      console.log(error);
      this.setState({ alert: { type: 'danger', message: `Error: ${error.message}`, open: true } });
    });
  }

  render() {
    if (this.state.alert.type && this.state.alert.message) {
      // TODO apply layouts
      var classString = 'bg-' + this.state.alert.type;
      var status = <div id="status" className={classString}>
                    <Dialog
                      modal={false}
                      open={this.state.alert.open}
                      onRequestClose={this.handleAlert}
                    >
                      {this.state.alert.message}
                    </Dialog>
                  </div>
    }
    return (
      <div className="gridRoot">
        {status}
        <div>
          <form onSubmit={this.handleOnSubmit} >
            <h1>Add Bet</h1>
            <div>
              <GridList
                className='gridList'
                cellHeight={'auto'}
                cols={3}
              >
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team_0_title"
                    value={this.state.team_0_title}
                    floatingLabelText="Team 0"
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
                    name="team_1_title"
                    value={this.state.team_1_title}
                    floatingLabelText="Team 1"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile
                  style={{marginTop: '10px'}}
                  cols={3}
                >
                  <SelectField
                    autoWidth={true}
                    floatingLabelText="Category"
                    value={this.state.category}
                    onChange={this.handleCategoryChange}
                  >
                    {this.menuItem(CATEGORIES, this.state.category)}
                  </SelectField>
                </GridTile>
                <GridTile
                  style={{marginTop: '10px'}}
                  cols={3}
                >
                  <SelectField
                    autoWidth={true}
                    floatingLabelText="Arbiter Address"
                    value={this.state.arbiterAddress}
                    onChange={this.handleArbiterAddressChange}
                  >
                    {this.menuItem(ARBITER_ADDRESSES, this.state.arbiterAddress)}
                  </SelectField>
                </GridTile>
              </GridList>
              <GridList
                className='gridList'
                style={{flexWrap: 'nowrap'}}
                cellHeight={'auto'}
              >
                <GridTile>
                  <DatePicker
                    autoOk={true}
                    floatingLabelText="Starts in"
                    defaultDate={this.state.timestampMatchBegin}
                    onChange={this.handleChangeTimestampMatchBegin}
                  />
                </GridTile>
                <GridTile>
                  <DatePicker
                    autoOk={true}
                    floatingLabelText="Ends in"
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
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Hard deadline"
                        defaultDate={this.state.timestampArbiterDeadline}
                        onChange={this.handleChangeTimestampArbiterDeadline}
                      />
                    </GridTile>
                    <GridTile>
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Terminate deadline"
                        defaultDate={this.state.timestampSelfDestructDeadline}
                        onChange={this.handleChangeTimestampSelfDestructDeadline}
                      />
                    </GridTile>
                  </GridList>
                </CardText>
              </Card><br />
            </div>
            <RaisedButton type="submit" label="Create" primary />
          </form>
        </div>
      </div>
    )
  }
}

export default BetForm;