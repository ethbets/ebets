import contract from 'truffle-contract';
import lodash from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { Dialog, FlatButton } from 'material-ui'
import { Card, CardHeader } from 'material-ui/Card';
import LinearProgress from 'material-ui/LinearProgress';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import * as MColors from 'material-ui/styles/colors';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import CircularProgress from 'material-ui/CircularProgress';

import BetController from './BetController';

import BetJson from 'build/contracts/Bet.json';
import GovernanceInterfaceJson from 'build/contracts/GovernanceInterface.json';
import getWeb3 from 'utils/getWeb3';
import stateTransitionFunctions from 'utils/stateTransitions';
import betFields from './betFields';
import {betState, stepperState} from 'utils/betStates';
import {formatEth} from 'utils/ethUtils';
import Timer from './Timer';
import Arbiters from './Arbiters';

import CancellationTokenSource from 'utils/CancellationTokenSource'

import BigNumber from 'bignumber.js';
const MOCK = false;
const mockDateBegin = new BigNumber(moment().unix() + 5);
const mockDateEnd = new BigNumber(moment().unix() + 10);
const mockResolverDeadline = new BigNumber(moment().unix() + 25);
const mockTerminateDeadline = new BigNumber(moment().unix() + 30);

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBetState: 0, // Overall current bet state (from time and contract state)
      betShoudlBeAtState: 0, // Related to time
      stepperState: 0,
      hasBetOnTeam: {team: null, value: new BigNumber(0)}, // {team: false/true/null, value: amount}
      open: false,
      betHappened: false,
      betStatusMessage: '',
      transactionInProcess: false,
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
    if (this.state.transactionInProcess)
      return <LinearProgress mode="indeterminate" />;
    return null;
  };

  updateStateFromTimer(timerState) {
    const newState = stateTransitionFunctions.fromTimerStateToCurrentState(
      this.state.currentBetState, timerState);
    if (newState !== null) {
      this.setState(newState);
    }
  }

  handleCloseDialog = () => {
    this.setState({betHappened: false});
  };

  BetStatusDialog = () => {
    const actions = [
      <FlatButton key='ok'
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleCloseDialog}
      />
    ];

    return (
      <Dialog
        title="Transaction Status"
        actions={actions}
        modal={false}
        open={this.state.betHappened}
        onRequestClose={this.handleCloseDialog}
      >
      {this.state.betStatusMessage}
      </Dialog>
    )
  }

  transactionHappened = betPromise => {
    var err = null;
    this.setState({ transactionInProcess: true });
    return betPromise.then(tx => {
      return this.setState({
        betStatusMessage: <div>Transaction OK
        <br/>Transaction hash: {tx.tx}
        <br/>Appended in block: {tx.receipt.blockNumber}
        </div>
      });
    })
    .catch(_err => {
      err = _err;
      this.setState({betStatusMessage: <div>Transaction FAILED<br/>Error: {err.toString()}</div>});
    })
    .then(() => {
      this.setState({betHappened: true});
      this.setState({transactionInProcess: false});
      if (err !== null)
        throw err;
    });
  };

  /* Begin
   * Functions to interact with contract
   */
  betOnTeam = (teamToBet, value) => {
    if (this.state.betContractInstance === undefined) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('Error instantiating contract, please report that on github.');
      }))
      return;
    }
    if (teamToBet === null) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('Must bet in a specific team!');
      }))
      return;
    }
    if (this.state.web3.eth.accounts.length === 0) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('You must unlock your account before betting!');
      }))
      return;
    }
    if (value === undefined ||
        value.lessThan(new BigNumber(0))) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('Must bet more than Ξ0');
      }))
      return;
    }
      
    const betPromise = this.state.betContractInstance.bet(
      teamToBet,
      { from: this.state.web3.eth.accounts[0],
        value: value
      });
    this.transactionHappened(betPromise)
    .catch(() => {
    })
  };
  callArbiter = () => {
    const callArbiterPromise = this.state.betContractInstance.updateResult(
      { from: this.state.web3.eth.accounts[0]
      });
    this.transactionHappened(callArbiterPromise);
  };
  callVote = (onTeam) => {
    const callVotePromise = this.state.arbiterContractInstance.castVote(
      this.props.address, onTeam,
      { from: this.state.web3.eth.accounts[0],
      });
    this.transactionHappened(callVotePromise);
  }
  withdraw = () => {
    const withdrawPromise = this.state.betContractInstance.withdraw(
    { from: this.state.web3.eth.accounts[0],
    });
    this.transactionHappened(withdrawPromise)
    .then(() => {
      this.setState({
        hasBetOnTeam : {
          team : null,
          amount : new BigNumber(0),
          stepperState: stepperState.matchDecision
        }
      });
    })
    .catch(() => {
    })
  }
  // End of contract interaction functions

  FilteredBet = () => {
    const betTitle = 
      <div style={{flexFlow: 'row', justifyContent: 'space-between'}}>
        <div style={{display: 'flex'}}>
          <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
            <Avatar size={32} backgroundColor={MColors.cyan800}>Ξ</Avatar>
            {formatEth(this.state.team0BetSum)}
          </Chip>
          <Chip backgroundColor={MColors.white}>
            {this.state.team0Name} vs {this.state.team1Name}
          </Chip>
          <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
            <Avatar size={32} backgroundColor={MColors.cyan800}>Ξ</Avatar>
            {formatEth(this.state.team1BetSum)}
          </Chip>
        <Timer parentState={this.state.currentBetState}
               updateState={this.updateStateFromTimer.bind(this)}
               beginDate={(MOCK) ? mockDateBegin : this.state.timestampMatchBegin}
               endDate={(MOCK) ? mockDateEnd : this.state.timestampMatchEnd}
               resolverDeadline={(MOCK) ? mockResolverDeadline : this.state.timestampArbiterDeadline}
               terminateDeadline={(MOCK) ? mockTerminateDeadline : this.state.timestampSelfDestructDeadline}
        />
        </div>
      </div>;

      if ((this.props.category === 'my_bets' && (this.state.hasBetOnTeam.team !== null
                                                 || this.state.hasEverBet)) ||
          // This category
          (this.props.category === this.state.category && this.state.isFeatured) ||
          // All the bets
          (this.props.category === 'all_bets' && this.state.isFeatured) ||
          // Unfeatured bets
          (this.props.category === 'unfeatured' && !this.state.isFeatured)) {
        
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
      }
      return null;
    }
    
  onExpand = () => {
    // NOTE: Don't reference this.state in this.setState
    this.setState(previousState => ({isExpanded: !previousState.isExpanded}));
  }

  componentWillMount() {
    var cst = new CancellationTokenSource;
    this.setState({cancellationToken: cst});
    getWeb3
    .then(async results => {
      try {
        await this.instantiateContract(results.web3, cst.token);
      }
      catch(err) {
        console.error('InstantiateContractError', err);
      }
    })
    .catch(err => {
      console.error('Error finding web3', err);
    });
  }
  componentWillUnmount() {
    this.state.cancellationToken.cancel();
  }
  
  // FIXME: This is wrong, we should check if route is my_bets
  // and only then pay the price of watching all transactions
  componentWillReceiveProps() {
    if (this.state.betContractInstance !== undefined) {
      this.hasBet(this.state.betContractInstance)
      .then(hasEverBet => {
        if (hasEverBet)
          this.setState({hasEverBet: true});
      });
    }
  }
        
  async instantiateContract(web3, cancellationToken) {
    var objs = {loadCompleted: true};
    async function setAttributes(attributeNames, contractInstance) {
      var promises = Object.keys(attributeNames).map(async (attr) => {
        if (attr in betFields
            && attr !== 'betsToTeam0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'betsToTeam1') { // idem
          objs[attr] = await contractInstance[attr]()
        }
      });
      await Promise.all(promises);
      return objs;
    }

    const betContract = contract(BetJson);
    const arbiterContract = contract(GovernanceInterfaceJson);
    arbiterContract.setProvider(web3.currentProvider);
    betContract.setProvider(web3.currentProvider);

    var betContractInstance = betContract.at(this.props.address);
    const governanceAddress = await betContractInstance.arbiter();
    
    const arbiterContractInstance = arbiterContract.at(governanceAddress);
    var isArbiter;
    var betsToTeam0;
    var betsToTeam1;
    if (web3.eth.accounts[0] !== undefined) {
      isArbiter = await arbiterContractInstance.isMember(web3.eth.accounts[0]);
      betsToTeam0 = await betContractInstance.betsToTeam0(web3.eth.accounts[0]);
      betsToTeam1 = await betContractInstance.betsToTeam1(web3.eth.accounts[0]);
    }
    else {
      betsToTeam0 = new BigNumber(0);
      betsToTeam1 = new BigNumber(0);
    }

    var stateObjects = await setAttributes(this.state, betContractInstance);
    //stateObjects['cat_url'] = require('assets/imgs/' + stateObjects.category + '.png');
    stateObjects['cat_url'] = require('assets/imgs/' + 'ufc' + '.png');

    const betToTeam = (betsToTeam0.greaterThan(new BigNumber(0))) ? false :
                      ((betsToTeam1.greaterThan(new BigNumber(0))) ? true : null);
    
    const newStates = stateTransitionFunctions.fromBetStateToCurrentState(
      stateObjects.betState.toNumber(), betToTeam);
    
    // Should check if has bet
    var hasEverBet = false;
    if (this.props.category === 'my_bets') {
      hasEverBet = await this.hasBet(betContractInstance);
    }
    const arbiterName = await arbiterContractInstance.getName();
    
    cancellationToken.throwIfCancelled();
    this.setState({
      ...stateObjects,
      web3: web3,
      hasBetOnTeam: {
        team: betToTeam,
        amount: (betToTeam === false) ? betsToTeam0 : 
                 (betToTeam === true) ? betsToTeam1 : new BigNumber(0)
      },
      hasEverBet: hasEverBet,
      currentBetState: newStates.newOverAllState,
      stepperState: newStates.newStepperState,

      isArbiter: isArbiter,
      arbiterContractInstance: arbiterContractInstance,
      arbiterInfo: {
        name: arbiterName,
        verified: Arbiters.isVerifiedArbiter(arbiterContractInstance.address)
      },
      betContractInstance: betContractInstance
    });
    // Only watch new events
    var laterEvents = betContractInstance.allEvents({
      fromBlock: 'latest',
      toBlock: 'latest'
    });
    
    laterEvents.watch((error, response) => {
      if (response.event === 'NewBet') {
        cancellationToken.throwIfCancelled();
        if (response.args.forTeam === false)
          this.setState(previousState => (
            { team0BetSum : previousState.team0BetSum.plus(response.args.amount)}));
        else
         this.setState(previousState => (
            { team1BetSum : previousState.team1BetSum.plus(response.args.amount)}));

        if (response.args.from === this.state.web3.eth.accounts[0]) {
          this.setState(previousState => {
            if (previousState.hasBetOnTeam.team === null)
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
      else if (response.event === 'StateChanged') {
        const responseState = response.args.state.toNumber();
        var newStates = stateTransitionFunctions.fromBetStateToCurrentState(
          responseState, this.state.hasBetOnTeam);
        cancellationToken.throwIfCancelled();
        this.setState({
          currentBetState: newStates.newOverAllState,
          stepperState: newStates.newStepperState
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
      if (this.state.hasBetOnTeam.team !== null)
        shouldPay = stepperState.payout;
      return {
        currentBetState: betState.team0Won,
        stepperState: shouldPay
    }})}, 20000);
    }
  }

  hasBet = (betContractInstance) => {
    return new Promise((resolve, reject) => {
      getWeb3.then(web3Result => {
        var betEvents = betContractInstance.allEvents({
        fromBlock: 0,
        toBlock: 'latest'});
        //this.setState({myBetsFilter: filter});
        betEvents.get((error, result) => {
          if (error) 
            reject(error);
          else {
            for (var betEvent in result)
              if (result[betEvent].args.from === web3Result.web3.eth.accounts[0]) {
                resolve(true);
                return;
              }
            resolve(false);
          }
        });
      });
    });
  }

  render() {
  if (!this.state.loadCompleted)
    return (<div style={{display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'}}>
              <CircularProgress /> 
            </div> ) ;

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
