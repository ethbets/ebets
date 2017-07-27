import moment from 'moment';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';

import getWeb3 from 'utils/getWeb3';
import EbetsJson from 'build/contracts/Ebets.json';

import betFields from 'components/betFields';
import versusIcon from 'assets/imgs/icons/vs.png';
import 'components/BetForm.css'

const HARD_DEADLINE_PERIOD = 7
const TERMINATE_DEADLINE_PERIOD = 14

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
      web3: null
    }
  }

  initializeTimestamps = () => {
      const currentDate = moment().toDate();
      this.setState({
        timestamp_match_begin: currentDate,
        timestamp_match_end: moment(currentDate).add(1, 'day').toDate(),
        timestamp_hard_deadline: moment(currentDate).add(HARD_DEADLINE_PERIOD, 'days').toDate(),
        timestamp_terminate_deadline: moment(currentDate).add(TERMINATE_DEADLINE_PERIOD, 'days').toDate()
      });
  }

  handleOnChange = (event) => {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  };

  handleChangeTimestampBegin = (event, date) => {
    this.setState({ timestamp_match_begin: date });
  };

  handleChangetimestamp_match_end = (event, date) => {
    this.setState({
      timestamp_match_end: date,
      timestamp_hard_deadline: moment(date).add(HARD_DEADLINE_PERIOD, 'days').toDate(),
      timestamp_terminate_deadline: moment(date).add(TERMINATE_DEADLINE_PERIOD, 'days').toDate(),
    });
  };

  handleChangetimestamp_hard_deadline = (event, date) => {
    this.setState({ timestamp_hard_deadline: date });
  };

  handleChangeTimestampTeminateDeadline = (event, date) => {
    this.setState({ timestamp_terminate_deadline: date });
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
        moment(this.state.timestamp_match_begin).unix(),
        moment(this.state.timestamp_match_end).unix(),
        moment(this.state.timestamp_hard_deadline).unix(),
        moment(this.state.timestamp_terminate_deadline).unix()
      ];

      let createdBet = instance.create_bet(
        this.state.team_0_title,
        this.state.team_1_title,
        this.state.category,
        this.state.team_0_id,
        this.state.team_1_id,
        timestamps,
        this.state.url_oraclize,
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
                cols={5}
              >
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team_0_title"
                    value={this.state.team_0_title}
                    placeholder="Team 0"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team_0_id"
                    value={this.state.team_0_id}
                    placeholder="Team 0 oracle id"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile
                  style={{width: 50, height: 50, marginLeft: 'auto', marginRight: 'auto'}}
                >
                  <img src={versusIcon} />
                </GridTile>
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team_1_title"
                    value={this.state.team_1_title}
                    placeholder="Team 1"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile>
                  <TextField
                    fullWidth={true}
                    name="team_1_id"
                    value={this.state.team_1_id}
                    placeholder="Team 1 oracle id"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile
                  style={{marginTop: '10px'}}
                  cols={2.5}
                >
                  <TextField
                    fullWidth={true}
                    name="url_oraclize"
                    value={this.state.url_oraclize}
                    placeholder="Oraclize URL"
                    onChange={this.handleOnChange}
                  />
                </GridTile>
                <GridTile
                  style={{marginTop: '10px'}}
                  cols={2.5}
                >
                  {/*TODO: display a list of categories as select box*/}
                  <TextField
                    fullWidth={true}
                    name="category"
                    value={this.state.category}
                    placeholder="Category"
                    onChange={this.handleOnChange}
                  />
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
                    defaultDate={this.state.timestamp_match_begin}
                    onChange={this.handleChangeTimestampBegin}
                  />
                </GridTile>
                <GridTile>
                  <DatePicker
                    autoOk={true}
                    floatingLabelText="Ends in"
                    defaultDate={this.state.timestamp_match_end}
                    onChange={this.handleChangetimestamp_match_end}
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
                      cols={2}
                    >
                    <GridTile>
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Hard deadline"
                        defaultDate={this.state.timestamp_hard_deadline}
                        onChange={this.handleChangetimestamp_hard_deadline}
                      />
                    </GridTile>
                    <GridTile>
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Terminate deadline"
                        defaultDate={this.state.timestamp_terminate_deadline}
                        onChange={this.handleChangeTimestampTeminateDeadline}
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