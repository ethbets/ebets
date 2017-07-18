import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { RaisedButton, Paper } from 'material-ui'
import {Card, CardTitle, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import Chip from 'material-ui/Chip';
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
      amountToBet : 0,
      ...betFields,
      web3: null, // TODO: REMOVE WEB3, DO STATIC
    }
  }

  setBet0Value = (event, newValue) => {
    this.setState({amountToBet0 : parseInt(newValue, 10), amountToBet1: 0});
    this.setExpectedGain(newValue);
  }


  setBet1Value = (event, newValue) => {
    this.setState({amountToBet1 : parseInt(newValue, 10), amountToBet0: 0});
    this.setExpectedGain(newValue);
  }

  setExpectedGain = (newValue) => {
    console.log(newValue);
    this.setState({amountToBet : parseInt(newValue, 10)});
  }

  ExpectedGain = () => {
    var expectedIncome;
    var amount;
    var winnerPool;
    var loserPool;

    var betTeam = -1;
    if (this.state.amountToBet0 > 0) betTeam = 0;
    else if(this.state.amountToBet1 > 0) betTeam = 1;

    if (betTeam === -1)
      return <GridTile></GridTile>

    if (betTeam === 0) {
      amount = this.state.amountToBet0;
      expectedIncome = this.state.amountToBet0;
      loserPool = this.state.team_1_bet_sum - 0.02*this.state.team_1_bet_sum;
      winnerPool = expectedIncome + this.state.team_0_bet_sum;
    }
    else {
      amount = this.state.amountToBet1;
      expectedIncome = this.state.amountToBet1;
      loserPool = this.state.team_0_bet_sum - 0.02*this.state.team_0_bet_sum;
      winnerPool = expectedIncome + this.state.team_1_bet_sum;
    }
    
    expectedIncome +=  (expectedIncome/winnerPool)*loserPool;
    if (amount === 0 || isNaN(amount))
      return <GridTile></GridTile>
    else
      return <GridTile>Expected gain: {parseFloat(expectedIncome).toFixed(2)} </GridTile>
  }

  ExpandedBet = (props) => {
    if (this.state.isExpanded) {
      return <GridList cols={5} cellHeight={20}>
            <GridTile></GridTile>
            <GridTile>
              <TextField type='number'
                style={{width: '100px'}} 
                name="jobNumber1"
                floatingLabelText="0 Eth"
                value={this.state.amountToBet0}
                onChange={this.setBet0Value}
              />
            </GridTile>
            <RaisedButton primary={true}>BET</RaisedButton>
            <GridTile>
              <TextField type='number'
                style={{width: '100px'}} 
                name="jobNumber2"
                floatingLabelText="0 Eth"
                value={this.state.amountToBet1}
                onChange={this.setBet1Value}
            />
            </GridTile>
            <this.ExpectedGain/>
            </GridList> 
    }
    else
      return <GridList cols={0} cellHeight={0}></GridList>
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
        if (attr in betFields
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
    betEvents.watch((error, response) => {
      console.log('Bet:', response.args);
      if (response.args.for_team === false)
        this.setState({ team_0_bet_sum : this.state.team_0_bet_sum + response.args.amount.toNumber() });
      else
        this.setState({ team_1_bet_sum : this.state.team_1_bet_sum + response.args.amount.toNumber() });
    });
  }

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
      <CardTitle
        actAsExpander={true}
        showExpandableButton={true}
      />

      <CardText>
      <div>
      <GridList cols={5} cellHeight={20}>
        <GridTile>{this.state.category}</GridTile>
        <GridTile>Ξ{this.state.team_0_bet_sum}</GridTile>
        <GridTile>{this.state.team_0} vs {this.state.team_1}</GridTile>
        <GridTile>Ξ{this.state.team_1_bet_sum}</GridTile>
        <GridTile>{ getState(this.state.bet_state) }</GridTile>
      </GridList>
      <this.ExpandedBet/>
      </div>
      </CardText>
      <ProgressBar /> 
         
      </Card>
    );
  }
}

export default Bet;
