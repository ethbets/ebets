import moment from 'moment';

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import {Card, CardHeader, CardText} from 'material-ui/Card';

import getWeb3 from 'utils/getWeb3';
import EbetsJson from 'build/contracts/ebets.json';

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
      title: '',
      description: '',
      category: '',
      team0: '',
      team1: '',
      timestampMatchBegin: currentDate,
      timestampMatchEnd: moment(currentDate).add(1, 'day').toDate(),
      timestampHardDeadline: moment(currentDate).add(HARD_DEADLINE_PERIOD, 'days').toDate(),
      timestampTerminateDeadline: moment(currentDate).add(TERMINATE_DEADLINE_PERIOD, 'days').toDate(),
      resolverAddress: '',
      urlOraclize: '',
      web3: null
    }
  };

  handleOnChange = event => {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  };

  handleChangeTimestampBegin = (event, date) => {
    this.setState({ timestampMatchBegin: date });
  };

  handleChangeTimestampMatchEnd = (event, date) => {
    this.setState({
      timestampMatchEnd: date,
      timestampHardDeadline: moment(date).add(HARD_DEADLINE_PERIOD, 'days').toDate(),
      timestampTerminateDeadline: moment(date).add(TERMINATE_DEADLINE_PERIOD, 'days').toDate(),
    });
  };

  handleChangeTimestampHardDeadline = (event, date) => {
    this.setState({ timestampHardDeadline: date });
  };

  handleChangeTimestampTeminateDeadline = (event, date) => {
    this.setState({ timestampTerminateDeadline: date });
  };

  handleOnSubmit = event => {
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

    // Declaring this for later so we can chain functions on SimpleStorage.
    let ebetsContractInstance;

    //create contract
    ebetsContract.deployed().then((instance) => {
      ebetsContractInstance = instance;

      //events
      let betsEvents = ebetsContractInstance.create_bet(
        this.state.title,
        this.state.category,
        this.state.team0,
        this.state.team1,
        moment(this.state.timestampMatchBegin).unix(),
        moment(this.state.timestampMatchEnd).unix(),
        moment(this.state.timestampHardDeadline).unix(),
        moment(this.state.timestampTerminateDeadline).unix(),
        this.state.urlOraclize
      );

      betsEvents.then(response => {
        console.log(response.args.bet_addr);
        this.setState({ alert: { type: 'success', message: 'Bet created successfully', open: true } });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ alert: { type: 'danger', message: `Error: ${error.message}`, open: true} });
      });
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
                  name="team0"
                  value={this.state.team0}
                  placeholder="Team0"
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="team1"
                  value={this.state.team1}
                  placeholder="Team1"
                  onChange={this.handleOnChange}
                /><br />
                <DatePicker
                  autoOk={true}
                  floatingLabelText="Starts in"
                  defaultDate={this.state.timestampMatchBegin}
                  onChange={this.handleChangeTimestampBegin}
                />
                <DatePicker
                  autoOk={true}
                  floatingLabelText="Ends in"
                  defaultDate={this.state.timestampMatchEnd}
                  onChange={this.handleChangeTimestampMatchEnd}
                />
                <TextField
                  name="resolverAddress"
                  value={this.state.resolverAddress}
                  placeholder="Resolver Address"
                  onChange={this.handleOnChange}
                /><br />
                <TextField
                  name="urlOraclize"
                  value={this.state.urlOraclize}
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
                        defaultDate={this.state.timestampHardDeadline}
                        onChange={this.handleChangeTimestampHardDeadline}
                      />
                      <DatePicker
                        autoOk={true}
                        floatingLabelText="Terminate deadline"
                        defaultDate={this.state.timestampTerminateDeadline}
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