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
import GovernanceInterfaceJson from 'build/contracts/GovernanceInterface.json';
import getWeb3 from 'utils/getWeb3';
import stateTransitionFunctions from 'utils/stateTransitions';
import betFields from './betFields';
import {betTimeStates, betState, stepperState, contractStates} from './betStates';
import Timer from './Timer';
import EbetsArbiters from 'utils/ebetsArbiters';

const MOCK = false;
const mockDateBegin = moment().unix() + 5;
const mockDateEnd = moment().unix() + 10;
class Bet extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      currentBetState: 0, // Overall current bet state (from time and contract state)
      betShoudlBeAtState: 0, // Related to time
      stepperState: 0,
      hasBetOnTeam: null, // null: no team or {team: false/true, value: amount}
      open: false,
      betHappened: false,
      betStatusMessage: '',
      betInProgress: false,
      isExpanded: false,
      loadCompleted: false,
      cat_url: null,
      isArbiter: false,
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

  /* Begin
   * Functions to interact with contract
   */
  betOnTeam = (teamToBet, value) => {
    if (this.state.betContractInstance === undefined ||
        teamToBet === undefined ||
        value === undefined ||
        value <= 0) {
      console.error('Error');
      return;
    }
    this.setState({ betInProgress: true });
    var betPromisse = this.state.betContractInstance.bet(
      teamToBet,
      { from: this.state.web3.eth.accounts[0],
        value: value
      });
    this.transactionHappened(betPromisse);
  };
  callArbiter = () => {
    var callArbiterPromise = this.state.betContractInstance.updateResult(
      { from: this.state.web3.eth.accounts[0]
      });
    this.transactionHappened(callArbiterPromise);
  };
  callVote = (onTeam) => {
    var callVotePromise = this.state.arbiterContractInstance.castVote(
      this.props.address, onTeam,
      { from: this.state.web3.eth.accounts[0],
      });
    this.transactionHappened(callVotePromise);
  }
  withdraw = () => {
    var withdrawPromise = this.state.betContractInstance.withdraw(
    { from: this.state.web3.eth.accounts[0],
    });
    this.transactionHappened(withdrawPromise);
  }
  // End of contract interaction functions

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
               resolverDeadline={this.state.timestampArbiterDeadline}
               terminateDeadline={this.state.timestampSelfDestructDeadline}
        />
      </div>;
      // My bets        
      if ((this.props.category  === 'my_bets' && this.state.hasBetOnTeam !== null) ||
        // This category
        (this.props.category === this.state.category && this.state.isFeatured) ||
        // All the bets
        (this.props.category === 'all_bets' && this.state.isFeatured) ||
        // Unfeatured and unfeatured category
        (this.props.category === 'unfeatured' && !this.state.isFeatured))
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
            hasBetOnTeam={this.state.hasBetOnTeam}
            team0BetSum={this.state.team0BetSum}
            team1BetSum={this.state.team1BetSum}
            tax={this.state.TAX}
            betOnTeamFunction={this.betOnTeam.bind(this)}
            callArbiterFunction={this.callArbiter.bind(this)}
            callVoteFunction={this.callVote.bind(this)}
            withdrawFunction={this.withdraw.bind(this)}
            betHappened={this.state.betHappened}
            isArbiter={this.state.isArbiter}
            arbiterInfo={this.state.arbiterInfo}
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
        
  async instantiateContract() {
    var self = this;
    var objs = {loadCompleted: true};
    function setAttributes(attributeNames, contractInstance) {
      var promises = Object.keys(attributeNames).map(async (attr) => {
        if (attr in betFields
            && attr !== 'betsToTeam0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'betsToTeam1') { // idem
          objs[attr] = await contractInstance[attr]()
        }
      });
      return Promise.all(promises).then(res => {
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
    const arbiterContract = contract(GovernanceInterfaceJson);
    arbiterContract.setProvider(this.state.web3.currentProvider);
    betContract.setProvider(this.state.web3.currentProvider);

    var betContractInstance = betContract.at(this.props.address);
    const governanceAddress = await betContractInstance.arbiter();
    
    const arbiterInstance = arbiterContract.at(governanceAddress);
    const isArbiter = await arbiterInstance.isMember(this.state.web3.eth.accounts[0]);
    await setAttributes(this.state, betContractInstance);
    this.setState({
      isArbiter: isArbiter,
      arbiterInstance: arbiterInstance,
      arbiterInfo: {
        name: await arbiterInstance.getName(),
        verified: EbetsArbiters.isVerifiedArbiter(arbiterInstance.address)
      },
      betContractInstance: betContractInstance
    });
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
          this.setState(previousState => {
            if (previousState.hasBetOnTeam === null)
              previousState.hasBetOnTeam = {
                team: response.args.forTeam,
                amount: response.args.amount
              };
            else
              previousState.hasBetOnTeam = {
                team: response.args.forTeam,
                amount: previousState.hasBetOnTeam.amount.add(response.args.amount)
              }
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
          if (this.state.hasBetOnTeam !== null)
            newStepperState = stepperState.payout;
        }
        else if (response.args.state === contractStates.TEAM_ONE_WON) {
          newOverAllState = betState.team1Won;
          if (this.state.hasBetOnTeam !== null)
            newStepperState = stepperState.payout;
        }
        else if (response.args.state === contractStates.DRAW) {
          newOverAllState = betState.draw;
          if (this.state.hasBetOnTeam !== null)
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
      if (this.state.hasBetOnTeam !== null)
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
