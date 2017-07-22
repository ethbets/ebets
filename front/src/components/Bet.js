import contract from 'truffle-contract';
import lodash from 'lodash';
import moment from 'moment';

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
import CircularProgress from 'material-ui/CircularProgress';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';

import BetJson from 'build/contracts/Bet.json';
import getWeb3 from 'utils/getWeb3';
import betFields from './betFields';
import {betTimeStates, betState, stepperState, contractStates} from './betStates';
import Timer from './Timer';
var mockDateBegin = moment().unix() + 5;
var mockDateEnd = moment().unix() + 10;

class Bet extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      currentBetState: 0, // Overall current bet state (from time and contract state)
      betShoudlBeAtState: 0, // Related to time
      stepperState: 0,
      betOnTeam: null,
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

  updateBetShouldBeAtState(new_state) {
    if (new_state === betTimeStates.matchRunning) {
      this.setState({
        currentBetState: betState.matchRunning,
        stepperState: stepperState.matchRunning
      });
    }
    else if (new_state === betTimeStates.matchEnded) {
      this.setState({
        currentBetState: betState.shouldCallOracle,
        stepperState: stepperState.matchEnded
    });
    }
    this.setState({betShoudlBeAtState: new_state});
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

  FilteredBet = () => {
      var betTitle = 
          <div className='inRows'>
            <div className='pushLeft'> 
              <RaisedButton primary={true}>{this.state.team_0_title} Ξ{this.state.team_0_bet_sum}</RaisedButton> vs <RaisedButton primary={true}>{this.state.team_1_title} Ξ{this.state.team_1_bet_sum}</RaisedButton>
            </div> 
            <Timer parentState={this.state.betShoudlBeAtState}
                   updateState={this.updateBetShouldBeAtState.bind(this)}
                   //beginDate={this.state.timestamp_match_begin}
                   beginDate={mockDateBegin}
                   //endDate={this.state.timestamp_match_end} 
                   endDate={mockDateEnd}
                   />
        </div>;
      console.log(this.state.category.toLowerCase(), this.props);
      // My bets
      if ((this.props.category  === 'my_bets' && this.state.betOnTeam !== null) ||
        (this.props.category  === this.state.category) ||
        (this.props.subcategory === this.state.category.toLowerCase()) ||
        (this.props.category === 'all_bets'))
        return (
          <Card containerStyle={{ backgroundColor: '#097986' }}
            // FIXME: when corrected https://github.com/callemall/material-ui/issues/7411
            onExpandChange={lodash.debounce(this.onExpand, 150)}
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
      return null;
    }


  Steps = () => {
    var BetDecision = () => {
      if (this.state.currentBetState <= betState.shouldCallOracle)
        return 'Result';
      else if (this.state.currentBetState === betState.team0Won)
        return `${this.state.team_0_title} won`;
      else if (this.state.currentBetState === betState.oracleUndecided)
        return 'Undecided';
      else if (this.state.currentBetState === betState.team1Won)
        return `${this.state.team_1_title} won`;
      else if (this.state.currentBetState === betState.draw)
        return 'Draw';
      return null;
    }

    return (
        <Stepper activeStep={this.state.stepperState}>
          <Step>
            <StepLabel>Place your bet!</StepLabel>
          </Step>
          <Step>
            <StepLabel>Match running</StepLabel>
          </Step>
          <Step>
            <StepLabel>Call Oracle</StepLabel>
          </Step>
          <Step>
            <StepLabel>{BetDecision()}</StepLabel>
          </Step>
          <Step>
            <StepLabel>Payout</StepLabel>
          </Step>
        </Stepper>
      );
  }

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
      return <RaisedButton backgroundColor='#FAD723'>Win Ξ{parseFloat(expectedIncome).toFixed(2)} </RaisedButton>
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
    var DynamicBetButton = () => {
      if (this.state.currentBetState === betState.shouldCallOracle) {
        return (
        <RaisedButton
          secondary={true}
          className="betBtn"
          onTouchTap={this.betOnTeam}
        ><span>Call Oracle</span>
        </RaisedButton>
        )
      }
      else if (this.state.stepperState === stepperState.payout)
        return (
        <RaisedButton 
          className="betBtn"
          primary={true}
          onTouchTap={this.betOnTeam}
        ><span>Withdraw</span>
        </RaisedButton>
        )
      return (
        <RaisedButton 
          disabled={(this.state.currentBetState !== betState.matchOpen)}
          className="betBtn"
          primary={true}
          onTouchTap={this.betOnTeam}
        ><span>Bet</span>
        </RaisedButton>
        )
    }

    if (this.state.isExpanded) {
    return <div>
        <SelectField style={{ width: 160 }} className='test'
          floatingLabelText="Team"
          value={this.state.selectedTeam}
          onChange={this.setTeam}
          disabled={this.state.betOnTeam !== null}
        >
          <MenuItem value={0} primaryText={this.state.team_0_title} />
          <MenuItem value={1} primaryText={this.state.team_1_title} />
        </SelectField>
        <TextField 
          disabled={(this.state.currentBetState >= betState.matchRunning)} 
          style={{ width: 80 }} 
          id='betAmount' 
          type='number' 
          onChange={this.setBetValue}
          />
        <DynamicBetButton />
        <this.ExpectedGain/>
        <this.LinearProgressCustom mode="indeterminate" />
        <this.BetStatusDialog />
        <this.Steps />
      </div>
    }
    return null;
  }
  
  onExpand = (expanded) => {
    // NOTE: Don't reference this.state in this.setState
    this.setState(previousState => ({isExpanded: !previousState.isExpanded}));
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
      
    var allBetEvents = betContractInstance.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    });

    allBetEvents.watch((error, response) => {
      if (response.event === 'new_bet') {
        if (response.args.from === this.state.web3.eth.accounts[0]) {
          this.setState({
            betOnTeam: response.args.for_team,
            selectedTeam: (response.args.for_team) ? 1 : 0
          });
        }
      }
      else if (response.event === 'state_changed') {
        var newOverAllState;
        var newStepperState;
        if (response.args.state === contractStates.OPEN) {
          newOverAllState = betState.matchOpen;
          newStepperState = stepperState.matchOpen
        }
        else if (response.args.state === contractStates.TEAM_ZERO_WON) {
          newOverAllState = betState.team0Won;
          if (this.state.betOnTeam)
            newStepperState = stepperState.payout;
        }
        else if (response.args.state === contractStates.TEAM_ONE_WON) {
          newOverAllState = betState.team1Won;
          if (this.state.betOnTeam)
            newStepperState = stepperState.payout;
        }
        else if (response.args.state === contractStates.DRAW) {
          newOverAllState = betState.draw;
          if (this.state.betOnTeam)
            newStepperState = stepperState.payout;
        }
        else if (response.args.state === contractStates.ORACLE_UNDECIDED) {
          newOverAllState = betState.oracleUndecided;
          newStepperState = stepperState.matchDecision;
        }
        this.setState({
          currentBetState: newOverAllState,
          stepperState: newStepperState
        });
      }
    });
    setTimeout(() => {this.setState(previousState => {
      var shouldPay = stepperState.matchDecision;
      if (this.state.betOnTeam)
        shouldPay = stepperState.payout;
      return {
        currentBetState: betState.draw,
        stepperState: shouldPay
    }})}, 15000);
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
    return ( <div className="center"> <CircularProgress /> </div> ) ;

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

    return <this.FilteredBet />
  }
}

export default Bet;
