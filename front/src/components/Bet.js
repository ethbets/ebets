import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { RaisedButton, Paper } from 'material-ui'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';

import BetJson from 'build/contracts/Bet.json';
import getWeb3 from 'utils/getWeb3';
import betFields from './betFields';

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded : false,
      ...betFields,
      web3: null, // TODO: REMOVE WEB3, DO STATIC
    }
  }

  onExpand = (expanded) => {
      console.log(this.props.address, this.state.isExpanded);
      this.setState({isExpanded: !this.state.isExpanded});
    }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      });

      // Instantiate contract once web3 provided.
      this.instantiateContract();
    })
    .catch((err) => {
      console.log('Error finding web3', err);
    });
  }

  instantiateContract() {
    var self = this;
    var objs = {};
    function setAttributes(attributeNames, contractInstance) {
      var promises = Object.keys(attributeNames).map(async (attr) => {
        if (attr !== 'web3' // FIXME: REMOVE ONCE WEB3 IS NOT HERE
            && attr !== 'isExpanded'
            && attr !== 'bets_to_team_0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'bets_to_team_1') { // idem

          var res = await betContractInstance[attr]();
          if (typeof res === 'object') // Handle BigNumber
            res = res.toNumber();
          else
            res = res.toString();
          objs[attr] = res;
          // self.setState(obj);
        }
      });
      Promise.all(promises).then(res => {
        self.setState(objs);
      })
    }

    const contract = require('truffle-contract');
    const betContract = contract(BetJson);
    betContract.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var betContractInstance = betContract.at(this.props.address);
    setAttributes(this.state, betContractInstance);

    var betEvents = betContractInstance.new_bet({fromBlock: 0, toBlock: 'latest'});
    console.log(betEvents);
    betEvents.watch((error, response) => {
      console.log('Bet:', response.args);
      if (response.args.for_team === false)
        this.setState({ team_0_bet_sum : this.state.team_0_bet_sum + response.args.amount.toNumber() });
      else
        this.setState({ team_1_bet_sum : this.state.team_1_bet_sum + response.args.amount.toNumber() });
    });
  }
  // Addr: {this.props.address} <br/>
  //         State: {this.state.bet_state} <br />
  //         Featured: {this.state.is_featured} <br />
  //         Team0 {this.state.team_0}: ${this.state.team_0_bet_sum} <br/>
  //         Team1 {this.state.team_1}: ${this.state.team_1_bet_sum} <br/>
  //         Category: {this.state.category} <br/>
  //         Begins: {this.state.timestamp_match_begin} <br/>
  //         Ends: {this.state.timestamp_match_end} <br/>
  //         Hard Deadline: {this.state.timestamp_hard_deadline} <br/>
  //         Terminate Deadline: {this.state.timestamp_terminate_deadline} <br/>
  //         Oracle: {this.state.url_oraclize}

  render() {

    var teams = this.state.title.split('x');
    var getState = (state) => {
      if (state === 0)
        return `Open bet`;
      else if (state === 1)
        return `${teams[0]} won`;
      else if (state === 2)
        return `${teams[1]} won`;
      else if (state === 3)
        return 'Draw';
      else if (state === 4)
        return 'Undecided';
    }
    var total = this.state.team_0_bet_sum + this.state.team_1_bet_sum;
    var percentage0 = (this.state.team_0_bet_sum / total)*100;
    var percentage1 = (this.state.team_1_bet_sum / total)*100;
    isNaN(percentage0) ? percentage0 = 0 : percentage0 = parseFloat(percentage0).toFixed(2);
    isNaN(percentage1) ? percentage1 = 0 : percentage1 = parseFloat(percentage1).toFixed(2);
    
    var state = getState(this.state.bet_state);

    var ExpandedBet = (props) => {
      if (this.state.isExpanded) {
        if (props.team === '0')
          return <RaisedButton primary='true'>BET0</RaisedButton>
        else
          return <RaisedButton secondary='true'>BET1</RaisedButton>
      }
      else
        return null;
    }

    var ProgressBar = () => {
      if (percentage0 !== 0 && percentage1 !== 0)
        return <Progress multi className='progressBar'>
          <Progress bar color="danger" value={percentage0}>{percentage0}%</Progress>
          <Progress bar color="success" value={percentage1}>{percentage1}%</Progress>
          </Progress>;
      else
        return null;
    }

    return (
      <Card
        onExpandChange={this.onExpand}
        expanded={this.state.isExpanded}
      >
        <CardHeader
          title={this.state.title}
          subtitle={this.state.category}
          actAsExpander={true}
          showExpandableButton={true}
        />
        
        <CardText className='bet'>
          <CardText className='team0'>
            <header className='teamTitle'>{teams[0]}</header>
            <Divider />
            ${this.state.team_0_bet_sum}
            <ExpandedBet team='0'/>
          </CardText>
          <CardText className='team1'>
            <header className='teamTitle'>{teams[1]}</header>
            <Divider />
            ${this.state.team_1_bet_sum}
            <ExpandedBet team='1'/>
          </CardText>
        </CardText>
        <ProgressBar />
      </Card>
    );
  }
}

export default Bet;
