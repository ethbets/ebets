import moment from 'moment';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import {Card, CardHeader, CardText} from 'material-ui/Card';

import getWeb3 from 'utils/getWeb3';
import EbetsJson from 'build/contracts/ebets.json';

import betFields from './betFields';

const HARD_DEADLINE_PERIOD = 7
const TERMINATE_DEADLINE_PERIOD = 14

class BetForm extends Component {

  constructor(props) {
    super(props)

    const currentDate = moment().toDate();

    this.state = {
      alert: {
        open: false,
        type: 'info',
        message: ''
      },
      ...betFields,
      web3: null
    }
    this.state.timestamp_match_begin = currentDate;
    this.state.timestamp_match_end = moment(currentDate).add(1, 'day').toDate();
    this.state.timestamp_hard_deadline = moment(currentDate).add(HARD_DEADLINE_PERIOD, 'days').toDate();
    this.state.timestamp_terminate_deadline = moment(currentDate).add(TERMINATE_DEADLINE_PERIOD, 'days').toDate();
  };

  handleOnChange = event => {
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
    console.log(this.state);
    event.preventDefault();
    // TODO: handle form errors
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
  }

  createContract() {
    const contract = require('truffle-contract');
    const ebetsContract = contract(EbetsJson);
    ebetsContract.setProvider(this.state.web3.currentProvider);

    //create contract
    ebetsContract.deployed().then(instance => {

      let createdBet = instance.create_bet(
        this.state.title,
        this.state.category,
        this.state.team_0,
        this.state.team_1,
        moment(this.state.timestamp_match_begin).unix(),
        moment(this.state.timestamp_match_end).unix(),
        moment(this.state.timestamp_hard_deadline).unix(),
        moment(this.state.timestamp_terminate_deadline).unix(),
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
      this.setState({ alert: { type: 'danger', message: `Error: ${error.message}`, open: true} });
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
      <div>
        {status}
        <div className="form">
          <div className="formScreen">
            <div className="formTitle">
              <h1>Add Bet</h1>
            </div>
            <form onSubmit={this.handleOnSubmit} >
              <div>
                <TextField 
                  name="title"
                  value={this.state.title}
                  placeholder="Title"
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="description"
                  value={this.state.description}
                  placeholder="Description"
                  multiLine={true}
                  rows={2}
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="category"
                  value={this.state.category}
                  placeholder="Category"
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="team_0"
                  value={this.state.team_0}
                  placeholder="Team 0"
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="team_1"
                  value={this.state.team_1}
                  placeholder="Team 1"
                  onChange={this.handleOnChange}
                /><br />
                <DatePicker
                  autoOk={true}
                  floatingLabelText="Starts in"
                  defaultDate={this.state.timestamp_match_begin}
                  onChange={this.handleChangeTimestampBegin}
                />
                <DatePicker
                  autoOk={true}
                  floatingLabelText="Ends in"
                  defaultDate={this.state.timestamp_match_end}
                  onChange={this.handleChangetimestamp_match_end}
                />
                <TextField
                  name="url_oraclize"
                  value={this.state.url_oraclize}
                  placeholder="Oraclize URL"
                  onChange={this.handleOnChange}
                /><br />
                <Card>
                  <CardHeader
                    title="Advanced options"
                    actAsExpander={true}
                    showExpandableButton={true}
                  />
                  <CardText expandable={true}>
                    <div>
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Hard deadline"
                        defaultDate={this.state.timestamp_hard_deadline}
                        onChange={this.handleChangetimestamp_hard_deadline}
                      />
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Terminate deadline"
                        defaultDate={this.state.timestamp_terminate_deadline}
                        onChange={this.handleChangeTimestampTeminateDeadline}
                      />
                      </div>
                  </CardText>
                </Card><br />
                <RaisedButton type="submit" label="Create" primary />
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default BetForm;