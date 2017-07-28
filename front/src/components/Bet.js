import contract from 'truffle-contract';
import lodash from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { RaisedButton, Dialog, FlatButton } from 'material-ui'
import { Card, CardHeader } from 'material-ui/Card';
import LinearProgress from 'material-ui/LinearProgress';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import * as MColors from 'material-ui/styles/colors';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import CircularProgress from 'material-ui/CircularProgress';

import BetController from './BetController'

import BetJson from 'build/contracts/Bet.json';
import getWeb3 from 'utils/getWeb3';
import betFields from './betFields';
import {betTimeStates, betState, stepperState, contractStates} from './betStates';
import Timer from './Timer';

const MOCK = true;
const mockDateBegin = moment().unix() + 5;
const mockDateEnd = moment().unix() + 10;

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
      loadCompleted: false,
      cat_url: null,
      stepIndex: 0,
      ...betFields,
      web3: null, // TODO: REMOVE WEB3, DO STATIC
    }
  }

  LinearProgressCustom = () => {
    if (this.state.betInProgress)
      return <LinearProgress mode="indeterminate" />;
    return null;
  };

  updateBetShouldBeAtState(newState) {
    if (newState === betTimeStates.matchRunning) {
      this.setState({
        currentBetState: betState.matchRunning,
        stepperState: stepperState.matchRunning
      });
    }
    else if (newState === betTimeStates.matchEnded) {
      this.setState({
        currentBetState: betState.shouldCallArbiter,
        stepperState: stepperState.matchEnded
    });
    }
    this.setState({betShoudlBeAtState: newState});
  }

  handleCloseDialog = () => {
    this.setState({betHappened: false});
  };

  BetStatusDialog = () => {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleCloseDialog}
      />
    ];

    return (
      <Dialog
        title="Bet status"
        actions={actions}
        modal={false}
        open={this.state.betHappened}
        onRequestClose={this.handleCloseDialog}
      >
      {this.state.betStatusMessage}
      </Dialog>
    )
  }

  transactionHappened = betPromisse => {
    return betPromisse.then(tx => {
      return this.setState({
        betStatusMessage: `Transaction OK
        \n\nTransaction hash: ${tx.tx}
        \n\nAppended in block: ${tx.receipt.blockNumber}\n`
      });
    })
    .catch(err => {
      this.setState({betStatusMessage: `Transaction FAILED\n\nCause: ${err.toString()}`});
    })
    .then(() => {
      this.setState({betHappened: true});
      this.setState({betInProgress: false});
    });
  };

  betOnTeam = (teamToBet, value) => {
    if (this.state.contractInstance === undefined ||
        teamToBet === undefined ||
        value === undefined ||
        value <= 0) {
      console.error('Error');
      return;
    }
    this.setState({ betInProgress: true });
    var betPromisse = this.state.contractInstance.bet(
      teamToBet,
      { from: this.state.web3.eth.accounts[0],
        value: value
      }
    );
    this.transactionHappened(betPromisse);
  };

  callArbiter = () => {
  var callArbiterPromise = this.state.contractInstance.updateResult(
    { from: this.state.web3.eth.accounts[0],
      value: 20e9
    }
  );
  this.transactionHappened(callArbiterPromise);
};

  FilteredBet = () => {
      var betTitle = 
      <div className='inRows'>
        <div className='pushLeft'>
          <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
            <Avatar size={32} backgroundColor={MColors.cyan800}>Ξ</Avatar>
            {this.state.team0BetSum.toString()}
          </Chip>
          <Chip backgroundColor={MColors.white}>
            {this.state.team0Name} vs {this.state.team1Name}
          </Chip>
          <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
            <Avatar size={32} backgroundColor={MColors.cyan800}>Ξ</Avatar>
            {this.state.team1BetSum.toString()}
          </Chip>
        </div> 
        <Timer parentState={this.state.betShoudlBeAtState}
               updateState={this.updateBetShouldBeAtState.bind(this)}
               beginDate={(MOCK) ? mockDateBegin : this.state.timestampMatchBegin}
               endDate={(MOCK) ? mockDateEnd : this.state.timestampMatchEnd}
        />
      </div>;
      // My bets
      if ((this.props.category  === 'my_bets' && this.state.betOnTeam !== null) ||
        (this.props.category  === this.state.category) ||
        (this.props.subcategory === this.state.category.toLowerCase()) ||
        (this.props.category === 'all_bets'))
        return (
          <Card
            // FIXME: when corrected https://github.com/callemall/material-ui/issues/7411
            onExpandChange={lodash.debounce(this.onExpand, 150)}
            expanded={this.state.isExpanded}
          >
          <CardHeader
            avatar={(this.state.cat_url != null) ? this.state.cat_url : <Avatar icon={<ImagePhotoCamera />} /> }
            title={betTitle}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <BetController
            currentBetState={this.state.currentBetState}
            team0Name={this.state.team0Name}
            team1Name={this.state.team1Name}
            stepperState={this.state.stepperState}
            isExpanded={this.state.isExpanded}
            betOnTeam={this.state.betOnTeam}
            team0BetSum={this.state.team0BetSum}
            team1BetSum={this.state.team1BetSum}
            betOnTeamFunction={this.betOnTeam.bind(this)}
            betHappened={this.state.betHappened}
            hasBetTeam0={this.state.betsToTeam0[this.state.web3.eth.accounts[0]]}
            hasBetTeam1={this.state.betsToTeam1[this.state.web3.eth.accounts[0]]}
          />
          <this.BetStatusDialog />
          <this.LinearProgressCustom mode="indeterminate" />
          </Card>
        );
      return null;
    }
    
  onExpand = () => {
    // NOTE: Don't reference this.state in this.setState
    this.setState(previousState => ({isExpanded: !previousState.isExpanded}));
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      });

      this.instantiateContract();
    })
    .catch(err => {
      console.error('Error finding web3', err);
    });
  }
        
  instantiateContract() {
    var self = this;
    var objs = {loadCompleted: true};
    function setAttributes(attributeNames, contractInstance) {
      self.setState({contractInstance: contractInstance});
      var promises = Object.keys(attributeNames).map(async (attr) => {
        if (attr in betFields
            && attr !== 'betsToTeam0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'betsToTeam1') { // idem

          var res = await betContractInstance[attr]();
          if (typeof res === 'object') // Handle BigNumber 
            objs[attr] = res;
          else
            objs[attr] = res.toString();
          // self.setState(obj);
        }
      });
      Promise.all(promises).then(res => {
        try {
          objs.cat_url = require('assets/imgs/' + objs.category + '.png');
        }
        catch (err) {
          objs.cat_url = null;
        }
        self.setState(objs);
      })
    }

    const betContract = contract(BetJson);
    betContract.setProvider(this.state.web3.currentProvider);

    var betContractInstance = betContract.at(this.props.address);
    setAttributes(this.state, betContractInstance);
      
    var allBetEvents = betContractInstance.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    });

    allBetEvents.watch((error, response) => {
      if (response.event === 'NewBet') {
        if (response.args.forTeam === false)
          this.setState(previousState => (
            { team0BetSum : previousState.team0BetSum.plus(response.args.amount)}));
        else
         this.setState(previousState => (
            { team1BetSum : previousState.team1BetSum.plus(response.args.amount)}));

        if (response.args.from === this.state.web3.eth.accounts[0]) {
          this.setState({
            betOnTeam: response.args.forTeam,
          });
        }
      }
      else if (response.event === 'stateChanged') {
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
        else if (response.args.state === contractStates.UNDECIDED) {
          newOverAllState = betState.arbiterUndecided;
          newStepperState = stepperState.matchDecision;
        }
        else if (response.args.state === contractStates.CALLED_RESOLVER) {
          newOverAllState = betState.calledArbiter;
          newStepperState = stepperState.matchEnded;
        }
        this.setState({
          currentBetState: newOverAllState,
          stepperState: newStepperState
        });
      }
    });
    if (MOCK) {
      setTimeout(() => {this.setState(() => {
        return {
          currentBetState: betState.calledArbiter,
        stepperState: stepperState.matchEnded
      }})}, 15000);
      setTimeout(() => {this.setState(() => {
      var shouldPay = stepperState.matchDecision;
      if (this.state.betOnTeam)
        shouldPay = stepperState.payout;
      return {
        currentBetState: betState.draw,
        stepperState: shouldPay
    }})}, 20000);
    }
  }
  render() {

  if (!this.state.loadCompleted)
    return ( <div className="center"> <CircularProgress /> </div> ) ;

    var total = this.state.team0BetSum + this.state.team1BetSum;
    var percentage0 = (this.state.team0BetSum / total)*100;
    var percentage1 = (this.state.team1BetSum / total)*100;
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
