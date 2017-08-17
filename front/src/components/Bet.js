/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

/*global web3:true */
import contract from 'truffle-contract';
import lodash from 'lodash';
import _ from 'lodash';
import moment from 'moment';

import PropTypes from 'prop-types';
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
import AutoComplete from 'material-ui/AutoComplete';

import BetController from './BetController';

import BetJson from 'build/contracts/Bet.json';
import ERC20Json from 'build/contracts/ERC20.json';
import GovernanceInterfaceJson from 'build/contracts/GovernanceInterface.json';
import stateTransitionFunctions from 'utils/stateTransitions';
import betFields from './betFields';
import {betState, stepperState} from 'utils/betStates';
import {formatEth} from 'utils/ethUtils';
import Timer from './Timer';
import Arbiters from 'components/Arbiters';
import ERC20Tokens from 'components/ERC20Tokens';

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
      stepperState: 0,
      hasBetOnTeam: {team: null, value: new BigNumber(0)}, // {team: false/true/null, value: amount}
      ERC20HasBetOnTeam: {},
      open: false,
      betHappened: false,
      betStatusMessage: '',
      transactionInProcess: false,
      isExpanded: false,
      loadCompleted: false,
      iconUrl: null,
      isArbiter: false,
      stepIndex: 0,
      currency: {name: 'Ether (default)', address: ''},
      erc20Contracts: {},
      ...betFields,
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
    if (web3.eth.accounts.length === 0) {
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

    if (this.state.currency.address === '') { 
      console.log('Betting using Ether');
      value = value.times(new BigNumber('1000000000000000000'));
      const betPromise = this.state.betContractInstance.bet(
        teamToBet,
        { from: web3.eth.accounts[0],
          value: value
        });
      this.transactionHappened(betPromise)
      .catch(() => {
      });
    }
    else {
      var erc20instance;
      var erc20decimals;
      var token = this.state.currency.name;
      var addr = this.state.currency.address;

      console.log('Instantiating ERC20 contract ' + name + ' at address ' + addr);
      this.instantiateERC20Contract(addr).then(() => {
        erc20instance = this.state.erc20Contracts[addr].instance;
        erc20decimals = this.state.erc20Contracts[addr].decimals;
        if (erc20decimals !== undefined && erc20decimals.greaterThanOrEqualTo(1) && erc20decimals.lessThanOrEqualTo(18)) {
          var power = (new BigNumber(10)).toPower(erc20decimals);
          value = value.times(power);
        }

        //TODO: this is for testing purposes only. This calls the fallback function of our ERC20 test contracts,
        //which gives tokens to the sender
        return new Promise((resolve, reject) => {
          web3.eth.sendTransaction({to: addr, from: web3.eth.accounts[0], data: ''}, function(err, transactionHash) {
            if (!err) {
              resolve();
            }
            else {
              reject(err);
            }
          });
        });
      })
      .then(() => {
        console.log('Sending Approval');
        return erc20instance.approve(
          this.state.betContractInstance.address,
          value,
          { from: web3.eth.accounts[0] }
        );
      })
      .then(tx => {
        console.log('Betting');
        const betPromise = this.state.betContractInstance.betERC20(
          this.state.currency.address,
          teamToBet,
          value,
          { from: web3.eth.accounts[0] }
        );
        this.transactionHappened(betPromise)
      })
      .catch((err) => {
        console.log('Betting error: ' + err);
      });
    }
  };
  callArbiter = () => {
    const callArbiterPromise = this.state.betContractInstance.updateResult(
      { from: web3.eth.accounts[0]
      });
    this.transactionHappened(callArbiterPromise);
  };
  callVote = (onTeam) => {
    const callVotePromise = this.state.arbiterContractInstance.castVote(
      this.props.address, onTeam,
      { from: web3.eth.accounts[0],
      });
    this.transactionHappened(callVotePromise);
  }
  withdraw = () => {
    const withdrawPromise = this.state.betContractInstance.withdraw(
    { from: web3.eth.accounts[0],
    });
    this.transactionHappened(withdrawPromise)
    .then(() => {
      this.setState({
        hasBetOnTeam : {
          team : null,
          amount : new BigNumber(0),
          stepperState: stepperState.matchDecision
        },
        ERC20HasBetOnTeam : {}
      });
    })
    .catch(() => {
    })
  }
  // End of contract interaction functions

  handleCurrencySubmit = (selectedItem, index) => {
    if (index !== -1) {
      this.setState({ currency: {name: selectedItem.textKey, address: selectedItem.valueKey}});
    }
  }

  Currency = () => {
    return (
      <AutoComplete
        textFieldStyle={{width: 160}}
        style={{width: 160, marginLeft: 20}}
        floatingLabelText="Currency"
        searchText={this.state.currency.name}
        onNewRequest={this.handleCurrencySubmit}
        openOnFocus={true}
        dataSource={ERC20Tokens.erc20tokens()}
        dataSourceConfig={{ text: 'textKey', value: 'valueKey' }}
        filter={AutoComplete.noFilter}
      />
    );
  }

  CurrencyId = () => {
    if (this.state.currency.address === '')
      return 'Ξ';
    return this.state.currency.name[0];
  }

  FilteredBet = () => {
    const betTitle = 
      <div style={{display: 'flex', flexFlow: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
        <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
          <Avatar size={32} backgroundColor={MColors.cyan800}>{this.CurrencyId()}</Avatar>
          {formatEth(this.state.team0BetSum)}
        </Chip>
        <Chip backgroundColor={MColors.white}>
          {this.state.team0Name} vs {this.state.team1Name}
        </Chip>
        <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white}>
          <Avatar size={32} backgroundColor={MColors.cyan800}>{this.CurrencyId()}</Avatar>
          {formatEth(this.state.team1BetSum)}
        </Chip>
        <this.Currency />
        <Timer parentState={this.state.currentBetState}
               updateState={this.updateStateFromTimer.bind(this)}
               beginDate={(MOCK) ? mockDateBegin : this.state.timestampMatchBegin}
               endDate={(MOCK) ? mockDateEnd : this.state.timestampMatchEnd}
               resolverDeadline={(MOCK) ? mockResolverDeadline : this.state.timestampArbiterDeadline}
               terminateDeadline={(MOCK) ? mockTerminateDeadline : this.state.timestampSelfDestructDeadline}
        />
      </div>;

      if (this.state.isFeatured === false && this.props.showUnfeatured === false)
        return null;
      // TODO: Pack arguments to BetController! 
      return (
        <Card
          // FIXME: when corrected https://github.com/callemall/material-ui/issues/7411
          onExpandChange={lodash.debounce(this.onExpand, 150)}
          expanded={(this.props.category === 'detailed') ? true : this.state.isExpanded}
        >
        <CardHeader
          avatar={(this.state.iconUrl != null) ? 
                    this.state.iconUrl : <Avatar icon={<ImagePhotoCamera />} /> }
          title={betTitle}
          style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
          showExpandableButton={(this.props.category === 'detailed') ? false : true}
        />
        <BetController
          isDetailed={(this.props.category === 'detailed') ? true : false}
          betContractInstance={this.state.betContractInstance}
          address={this.props.address}
          currentBetState={this.state.currentBetState}
          team0Name={this.state.team0Name}
          team1Name={this.state.team1Name}
          stepperState={this.state.stepperState}
          isExpanded={(this.props.category === 'detailed') ? true : this.state.isExpanded}
          hasBetOnTeam={this.state.hasBetOnTeam}
          ERC20HasBetOnTeam={this.state.ERC20HasBetOnTeam}
          team0BetSum={this.state.team0BetSum}
          team1BetSum={this.state.team1BetSum}
          ERC20Team0BetSum={this.state.ERC20Team0BetSum}
          ERC20Team1BetSum={this.state.ERC20Team1BetSum}
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
    
  onExpand = () => {
    // NOTE: Don't reference this.state in this.setState
    this.setState(previousState => ({isExpanded: !previousState.isExpanded}));
  }

  componentWillMount() {
    var cst = new CancellationTokenSource;
    this.setState({cancellationToken: cst});
    this.instantiateContract(cst.token);
  }
  componentWillUnmount() {
    this.state.cancellationToken.cancel();
  }
  
  // // FIXME: This is wrong, we should check if route is my_bets
  // // and only then pay the price of watching all transactions
  // componentWillReceiveProps() {
  //   if (this.state.betContractInstance !== undefined) {
  //     this.hasBet(this.state.betContractInstance)
  //     .then(hasEverBet => {
  //       if (hasEverBet)
  //         this.setState({hasEverBet: true});
  //     });
  //   }
  // }

  instantiateERC20Contract(address) {
    return new Promise((resolve, reject) => {
      if (address in this.state.erc20Contracts)
        resolve();

      const erc20Contract = contract(ERC20Json);
      erc20Contract.setProvider(web3.currentProvider);
      var erc20Instance = erc20Contract.at(address);

      erc20Instance.then(() => {
        return erc20Instance.decimals();
      })
      .then((dec) => {
        var _erc20Contracts = _.clone(this.state.erc20Contracts);
        _erc20Contracts[address] = {instance: erc20Instance, decimals: dec};
        this.setState({ erc20Contracts : _erc20Contracts});
        resolve();
      })
      .catch(err => {
        console.log('Could not instantiate ERC20 contract: ' + err);
        reject(err);
      });
    });
  }

  async instantiateContract(cancellationToken) {
    var objs = {loadCompleted: true};
    async function setAttributes(attributeNames, contractInstance) {
      var promises = Object.keys(attributeNames).map(async (attr) => {
        if (attr in betFields
            && attr !== 'betsToTeam0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'betsToTeam1'
            && attr !== 'validERC20'
            && attr !== 'ERC20BetsToTeam0'
            && attr !== 'ERC20BetsToTeam1'
            && attr !== 'ERC20Team0BetSum'
            && attr !== 'ERC20Team1BetSum') { // idem
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
    var betAddress;
    var showDetails = false;
    if (this.props.params !== undefined) {
      betAddress = this.props.params.address;
      showDetails = true;
    }
    else
      betAddress = this.props.address;
    var betContractInstance = betContract.at(betAddress);
    const governanceAddress = await betContractInstance.arbiter();
    
    const arbiterContractInstance = arbiterContract.at(governanceAddress);
    var isArbiter;
    var betsToTeam0;
    var betsToTeam1;
    //TODO: finish implementing for ERC20
    var ERC20BetsToTeam0;
    var ERC20BetsToTeam1;
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
    try{
      stateObjects['iconUrl'] = require('assets/imgs/' + stateObjects.category + '.png');
    }
    catch(err) {
      stateObjects['iconUrl'] = null;
    }

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
        verified: Arbiters.isVerifiedArbiter(arbiterContractInstance.address, this.context.web3.networkId)
      },
      betContractInstance: betContractInstance,
      showDetails: showDetails
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

        if (response.args.from === web3.eth.accounts[0]) {
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
      else if (response.event === 'NewBetERC20') {
        cancellationToken.throwIfCancelled();
        var erc20Team0BetSum = _.clone(this.state.ERC20Team0BetSum);
        var erc20Team1BetSum = _.clone(this.state.ERC20Team1BetSum);
        var erc20 = response.args.erc20;
        var amount = response.args.amount;

        if (this.state.validERC20.indexOf(erc20) === -1) {
          var _valid = _.clone(this.state.validERC20);
          _valid.push(erc20);
          this.setState({ validERC20 : _valid });
          erc20Team0BetSum[erc20] = new BigNumber(0);
          erc20Team1BetSum[erc20] = new BigNumber(0);
        }

        if (response.args.forTeam === false) {
          erc20Team0BetSum[erc20] = erc20Team0BetSum[erc20].plus(amount);
          this.setState({ ERC20Team0BetSum : erc20Team0BetSum});
        }
        else {
          erc20Team1BetSum[erc20] = erc20Team1BetSum[erc20].plus(amount);
          this.setState({ ERC20Team1BetSum : erc20Team1BetSum});
        }

        if (response.args.from === web3.eth.accounts[0]) {
          var erc20HasBetOnTeam = _.clone(this.state.ERC20HasBetOnTeam);
          if (erc20 in erc20HasBetOnTeam) {
            erc20HasBetOnTeam[erc20] = { team: response.args.forTeam, amount: erc20HasBetOnTeam[erc20].amount.add(amount) };
          }
          else {
            erc20HasBetOnTeam[erc20] = { team: response.args.forTeam, amount: (new BigNumber(amount)) };
          }
          this.setState({ ERC20HasBetOnTeam : erc20HasBetOnTeam });
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
      var betEvents = betContractInstance.allEvents({
      fromBlock: 0,
      toBlock: 'latest'});
      //this.setState({myBetsFilter: filter});
      betEvents.get((error, result) => {
        if (error) 
          reject(error);
        else {
          for (var betEvent in result)
            if (result[betEvent].args.from === web3.eth.accounts[0]) {
              resolve(true);
              return;
            }
          resolve(false);
        }
      });
    });
  }

  render() {
    if (!this.state.loadCompleted)
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <CircularProgress /> 
        </div>
      );

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

Bet.contextTypes = {
  web3: PropTypes.object
};

export default Bet;
