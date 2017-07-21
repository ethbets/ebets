import contract from 'truffle-contract';
import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { RaisedButton, FlatButton } from 'material-ui'
import { Card, CardHeader, CardTitle } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';
import Avatar from 'material-ui/Avatar';

import BetJson from 'build/contracts/Bet.json';
import getWeb3 from 'utils/getWeb3';
import betFields from './betFields';
import Timer from './Timer';

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      betHappened: false,
      betStatusMessage: '',
      betInProgress: false,
      isExpanded: false,
      selectedTeam: '',
      amountToBet: 0,
      loadCompleted: false,
      cat_url: '',

      ...betFields,
      web3: null, // TODO: REMOVE WEB3, DO STATIC
    }
  }

  handleCloseDialog = () => {
    this.setState({betHappened: false});
  };

  setTeam = (event, index, value) => {
    console.log(value);
    this.setState({selectedTeam: value});
  };

  setBetValue = (event, newValue) => {
    this.setState({amountToBet : parseInt(newValue, 10)});
  };

  betOnTeam = () => {
    console.log(this.state.contractInstance);
    if (this.state.contractInstance === undefined ||
        this.state.selectedTeam === '' ||
        this.state.amountToBet <= 0 ||
        this.state.amountToBet === '') {
      console.log('Error');
      return;
    }
    this.setState({ betInProgress: true });
    var betPromisse = this.state.contractInstance.bet(
      this.state.selectedTeam === 1,
      { from: this.state.web3.eth.accounts[0],
        value: this.state.amountToBet
      }
    );
    betPromisse.then(tx => {
      console.log(tx);
      this.setState({
        betStatusMessage: 'Transaction hash: ' + tx.tx + 
        '\n\nAppended in block: ' + tx.receipt.blockNumber + '\n'
      })
    })
    .catch(err => {
      this.setState({betStatusMessage: err.toString()});
    })
    .then(() => {
      this.setState({betHappened: true});
      this.setState({betInProgress: false});
    })
  };

  ExpectedGain = () => {
    var expectedIncome;
    var amount;
    var winnerPool;
    var loserPool;

    if (this.state.selectedTeam === '')
      return null;

    if (this.state.selectedTeam === 0) {
      amount = this.state.amountToBet;
      expectedIncome = this.state.amountToBet;
      loserPool = this.state.team_1_bet_sum - 0.02*this.state.team_1_bet_sum;
      winnerPool = expectedIncome + this.state.team_0_bet_sum;
    }
    else {
      amount = this.state.amountToBet;
      expectedIncome = this.state.amountToBet;
      loserPool = this.state.team_0_bet_sum - 0.02*this.state.team_0_bet_sum;
      winnerPool = expectedIncome + this.state.team_1_bet_sum;
    }
    
    expectedIncome +=  (expectedIncome/winnerPool)*loserPool;
    if (amount === 0 || isNaN(amount))
      return null
    else
      return <div> Expected gain: {parseFloat(expectedIncome).toFixed(2)} </div>
  }

  LinearProgressCustom = (props) => {
    if (this.state.betInProgress)
      return <LinearProgress mode="indeterminate" />;
    return null;
  };

  BetStatusDialog = (props) => {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleCloseDialog}
      />
    ];

    return <Dialog
          title="Bet status"
          actions={actions}
          modal={false}
          open={this.state.betHappened}
          onRequestClose={this.handleCloseDialog}
        >
        {this.state.betStatusMessage}
        </Dialog>
  }

  ExpandedBet = (props) => {
    if (this.state.isExpanded) {
    return <div>
        <div>
          Ξ{this.state.team_0_bet_sum} Ξ{this.state.team_1_bet_sum}
        </div>
        <SelectField className='test'
          floatingLabelText="Team"
          value={this.state.selectedTeam}
          onChange={this.setTeam}
        >
          <MenuItem value={0} primaryText={this.state.team_0_title} />
          <MenuItem value={1} primaryText={this.state.team_1_title} />
        </SelectField>
        <TextField id='betAmount' type='number' onChange={this.setBetValue}/>
        <RaisedButton primary={true} onTouchTap={this.betOnTeam}>BET</RaisedButton>
        <this.LinearProgressCustom mode="indeterminate" />
        <this.ExpectedGain/>
        <this.BetStatusDialog />
      </div>
    }
    return null;
  }
  
  onExpand = (expanded) => {
    // FIXME: There is a bug here, onExpand is called twice
    // FIXME: Don't reference this.state in this.setState
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
    .catch(err => {
      console.log('Error finding web3', err);
    });

 
  }
        
  instantiateContract() {
    var self = this;
    var objs = {loadCompleted: true};
    function setAttributes(attributeNames, contractInstance) {
      self.setState({contractInstance: contractInstance});
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
        objs.cat_url = require('assets/imgs/' + objs.category + '.png')
        self.setState(objs);
      })
    }

    const betContract = contract(BetJson);
    betContract.setProvider(this.state.web3.currentProvider);

    var betContractInstance = betContract.at(this.props.address);
    setAttributes(this.state, betContractInstance);

    var newBetEvent = betContractInstance.new_bet({fromBlock: 0, toBlock: 'latest'});
    newBetEvent.watch((error, response) => {
      if (response.args.for_team === false)
        this.setState(previousState => {
          return { team_0_bet_sum : previousState.team_0_bet_sum + response.args.amount.toNumber() }
        });
      else
        this.setState(previousState => {
          return { team_1_bet_sum : previousState.team_1_bet_sum + response.args.amount.toNumber() };
        });
    });
  }
// <CardText>
//       <div>
//       <GridList cols={5} cellHeight={20}>
//         <GridTile>{this.state.category}</GridTile>
//         <GridTile>Ξ{this.state.team_0_bet_sum}</GridTile>
//         <GridTile>{this.state.team_0} vs {this.state.team_1}</GridTile>
//         <GridTile>Ξ{this.state.team_1_bet_sum}</GridTile>
//         <GridTile>{ getState(this.state.bet_state) }</GridTile>
//       </GridList>
//       <this.ExpandedBet/>
//       </div>
//       </CardText>
//       <ProgressBar /> 
  render() {

  if (!this.state.loadCompleted)
    return null;

    var betTitle = 
      <div className='card'>
        <div className='inRows'>
          <div className='pushLeft'> 
            {this.state.team_0_title} vs {this.state.team_1_title}
          </div> 
          <Timer date={this.state.timestamp_match_begin}/>  
        </div>
      </div>;

    var getState = (state) => {
      if (state === 0)
        return 'Open bet';
      else if (state === 1)
        return `${this.state.team_0_title} won`;
      else if (state === 2)
        return `${this.state.team_0_title} won`;
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
      <CardHeader
        avatar={this.state.cat_url}
        title={betTitle}
        actAsExpander={true}
        showExpandableButton={true}
      />
      <this.ExpandedBet/>
      </Card>
    );
  }
}

export default Bet;
