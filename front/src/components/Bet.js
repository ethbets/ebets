/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

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
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import BetController from './BetController';

import BetJson from 'build/contracts/Bet.json';
import ERC20Json from 'build/contracts/ERC20.json';
import GovernanceInterfaceJson from 'build/contracts/GovernanceInterface.json';
import stateTransitionFunctions from 'utils/stateTransitions';
import betFields from './betFields';
import ERC20Fields from './ERC20Fields';
import {betState, stepperState} from 'utils/betStates';
import {formatEth, formatToken} from 'utils/ethUtils';
import isAddress from 'utils/validateAddress';
import {computeFinalGain} from 'utils/betMath';
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
      hasBetOnTeam: null, 
      hasBetOnTeamEther: {team: null, value: new BigNumber(0)}, // {team: false/true/null, value: amount}
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
      currency: '',
      currencyName: 'Ether (default)',
      currencyErrorMsg: '',
      erc20Contracts: {},
      withdrawHappened: false,
      withdrawTable: [],
      withdrawTokens: [],
      approvalData: {},
      approvalHappened: false,
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
      //this.setState({betStatusMessage: <div>Transaction FAILED<br/>Error: {err.toString()}</div>});
      this.setState({betStatusMessage: <div>Transaction FAILED<br/></div>});
    })
    .then(() => {
      this.setState({betHappened: true});
      this.setState({transactionInProcess: false});
      if (err !== null)
        throw err;
    })
    .catch(err => { console.log('ERROR: ' + err); });
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
    if (this.context.web3.web3.eth.defaultAccount === undefined) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('You must unlock your account before betting!');
      }))
      return;
    }
    if (value === undefined || value.lessThan(new BigNumber(0))) {
      this.transactionHappened(new Promise((resolve, reject) => {
        reject('Must bet more than Ξ0');
      }))
      return;
    }

    if (this.state.currency === '') { 
      console.log('Betting using Ether');
      value = value.times(new BigNumber(1e18));
      const betPromise = this.state.betContractInstance.bet(
        teamToBet,
        { from: this.context.web3.web3.eth.defaultAccount,
          value: value
        });
      this.transactionHappened(betPromise)
      .catch(() => {
      });
    }
    else {
      var erc20instance;
      var erc20decimals;
      var addr = this.state.currency;

      this.instantiateERC20Contract(addr).then(() => {
        erc20instance = this.state.erc20Contracts[addr].instance;
        erc20decimals = this.state.erc20Contracts[addr].decimals;
        if (erc20decimals.greaterThanOrEqualTo(1) /*&& erc20decimals.lessThanOrEqualTo(18)*/) {
          var power = (new BigNumber(10)).toPower(erc20decimals);
          value = value.times(power);
        }

        //TODO: this is for testing purposes only. This calls the fallback function of our ERC20 test contracts,
        //which gives tokens to the sender
        /*
        return new Promise((resolve, reject) => {
          this.context.web3.web3.eth.sendTransaction({
            to: addr,
            from: this.context.web3.web3.eth.defaultAccount, 
            data: ''}, (err, transactionHash) => {
            if (!err) {
              resolve();
            }
            else {
              reject(err);
            }
          });
        });
        */
      //})
      //.then(() => {
        console.log('Sending Approval');
        var _apData = { erc20Instance: erc20instance, value: value, team: teamToBet };
        this.setState({transactionInProcess: true,
                       approvalHappened: true,
                       approvalData: _apData});
      })
      .catch((err) => {
        console.log('Bet was not succesful: ' + err);
        this.setState({transactionInProcess: false,
                       approvalHappened: false,
                       approvalData: {}});
      });
    }
  };

  sendApproval = () => {
    this.state.approvalData.erc20Instance.approve(
      this.state.betContractInstance.address,
      this.state.approvalData.value,
      { from: this.context.web3.web3.eth.defaultAccount }
    )
    .then(tx => {
      console.log('Betting');
      const betPromise = this.state.betContractInstance.betERC20(
        this.state.currency,
        this.state.approvalData.team,
        this.state.approvalData.value,
        { from: this.context.web3.web3.eth.defaultAccount }
      );
      this.transactionHappened(betPromise)
    })
    .catch((err) => {
      console.log('Bet was not successful: ' + err);
      this.setState({ transactionInProcess: false });
    })
  }

  callArbiter = (closeBet = false) => {
    var callArbiterPromise;
    if (closeBet)
      callArbiterPromise = this.state.betContractInstance.close(
        { from: this.context.web3.web3.eth.defaultAccount
        });
    else
      callArbiterPromise = this.state.betContractInstance.updateResult(
        { from: this.context.web3.web3.eth.defaultAccount
        });
    this.transactionHappened(callArbiterPromise);
  };

  callVote = (onTeam) => {
    const callVotePromise = this.state.arbiterContractInstance.castVote(
      this.props.address, onTeam,
      { from: this.context.web3.web3.eth.defaultAccount,
      });
    this.transactionHappened(callVotePromise);
  }

  clearApproval = () => {
    this.setState({ transactionInProcess: false,
                    approvalHappened : false,
                    approvalData : {}});
  };

  handleApprovalOk = () => {
    this.setState({approvalHappened: false});
    this.sendApproval();
  };

  ApprovalStatusDialog = () => {
    const actions = [
      <FlatButton key='cancel'
        label="Cancel"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.clearApproval}
      />,
      <FlatButton key='ok'
        label="Ok"
        primary={true}
        keyboardFocused={false}
        onTouchTap={this.handleApprovalOk}
      />
    ];

    return (
      <Dialog
        title="An approval transaction from you to this bet will be sent to the selected ERC20 token, following by the transfer transaction. Do you confirm?"
        actions={actions}
        modal={false}
        open={this.state.approvalHappened}
        onRequestClose={this.clearApproval}
      >
      </Dialog>
    );
  }


  clearWithdraw = () => {
    this.setState({ withdrawTable : [],
                    withdrawHappened : false,
                    withdrawTokens : []});
  };

  handleWithdrawOk = () => {
    this.setState({withdrawHappened: false});
    this.withdrawRewards();
  };

  WithdrawStatusDialog = () => {
    const actions = [
      <FlatButton key='cancel'
        label="Cancel"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.clearWithdraw}
      />,
      <FlatButton key='ok'
        label="Ok"
        primary={true}
        keyboardFocused={false}
        disabled={this.state.withdrawTable === null || this.state.withdrawTable.length === 0}
        onTouchTap={this.handleWithdrawOk}
      />
    ];

    if (this.state.withdrawTable === null || this.state.withdrawTable.length === 0)
      return (
        <Dialog
          title="No rewards to withdraw"
          actions={actions}
          modal={false}
          open={this.state.withdrawHappened}
          onRequestClose={this.clearWithdraw}
        >
        </Dialog>
      );

    return (
      <Dialog
        title="Withdraw rewards"
        actions={actions}
        modal={false}
        open={this.state.withdrawHappened}
        onRequestClose={this.clearWithdraw}
      >
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={{textAlign: 'left'}}>Currency</TableHeaderColumn>
              <TableHeaderColumn>Bet</TableHeaderColumn>
              <TableHeaderColumn>Reward</TableHeaderColumn>
              <TableHeaderColumn>Reason</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.state.withdrawTable}
          </TableBody>
        </Table>
      </Dialog>
    );
  }

  WithdrawTableEntry = (_key, _currency, _amount, _reward, _reason) => {
    return (
      <TableRow key={_key}>
        <TableRowColumn>{_currency}</TableRowColumn>
        <TableRowColumn>{formatEth(_amount)}</TableRowColumn>
        <TableRowColumn>{formatEth(_reward)}</TableRowColumn>
        <TableRowColumn>{_reason}</TableRowColumn>
      </TableRow>
    );
  }

  withdraw = () => {
    var _tokens = [];
    var _table = [];

    var draw = false;
    var winner = null;
    var _amount;
    if (this.state.currentBetState === betState.team0Won)
      winner = false;
    else if (this.state.currentBetState === betState.team1Won)
      winner = true;
    else if (this.state.currentBetState === betState.draw)
      draw = true;
    else
      return;

    var _hasBetEther = this.state.hasBetOnTeamEther;
    if (_hasBetEther.team !== null && _hasBetEther.amount.gt(0)) {
      if (draw || _hasBetEther.team === winner) {
        if (draw)
          _amount = _hasBetEther.amount;
        else if (_hasBetEther.team === winner)
          _amount = this.FinalGainEther();
        _table.push(this.WithdrawTableEntry('Ether', 'Ether', _hasBetEther.amount, _amount, ''));
      }
      else if ( ( _hasBetEther.team === false && this.state.team1BetSum.isZero() ) ||
                ( _hasBetEther.team === true && this.state.team0BetSum.isZero() )
              ) {
        _table.push(this.WithdrawTableEntry('Ether', 'Ether', _hasBetEther.amount, _hasBetEther.amount, '(no counter-bet)'));
      }
    }

    var _erc20Promises = [];
    for (var i = 0; i < this.state.validERC20.length; ++i) {
      var erc20 = this.state.validERC20[i];
      if ((erc20 in this.state.ERC20HasBetOnTeam) && this.state.ERC20HasBetOnTeam[erc20].amount.gt(0)) {
        _erc20Promises.push(this.instantiateERC20Contract(erc20));
        _tokens.push(erc20);
      }
    }
    Promise.all(_erc20Promises)
    .then(() => {
      for (var i = 0; i < _erc20Promises.length; ++i) {
        var erc20 = _tokens[i];
        var _hasBet = this.state.ERC20HasBetOnTeam[erc20];
        var _reason = '';
        if (draw)
          _amount = _hasBet.amount;
        else if(_hasBet.team === winner)
          _amount = this.FinalGainByCurrency(erc20);
        else if ( ( _hasBet.team === false && this.state.ERC20Team1BetSum[erc20].isZero() ) ||
                  (  _hasBet.team === true && this.state.ERC20Team0BetSum[erc20].isZero() )
                ) {
          _amount = _hasBet.amount;
          _reason = '(no counter-bet)';
        }
        else continue;
        var _name = this.state.erc20Contracts[erc20].name;
        _table.push(this.WithdrawTableEntry(erc20, _name, _hasBet.amount, _amount, _reason));
      }
      this.setState({ withdrawTable : _table,
                      withdrawHappened : true,
                      withdrawTokens: _tokens
                    });
    })
    .catch(err => {
      console.log('Could not instantiate contracts: ' + err);
    })
  }

  withdrawRewards = () => {
    const withdrawPromise = this.state.betContractInstance.withdraw(
    this.state.withdrawTokens,
    { from: this.context.web3.web3.eth.defaultAccount,
    });
    this.transactionHappened(withdrawPromise)
    .then(() => {
      this.setState({
        withdrawTable : [],
        withdrawTokens : [],
        hasBetOnTeam : null,
        hasBetOnTeamEther : {
          team : null,
          amount : new BigNumber(0),
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
      var addr = selectedItem.valueKey.toLowerCase();
      if (addr !== '') {
        this.setState({ currency: addr, currencyName: selectedItem.textKey});
        this.instantiateERC20Contract(addr)
        .then(() => {
          this.setState({ currencyErrorMsg: ''});
        })
        .catch((err) => {
          this.setState({ currencyErrorMsg: 'Invalid ERC20 token address'});
        });
      }
      else {
        this.setState({ currency: addr, currencyName: 'Ether (default)', currencyErrorMsg: ''});
      }
    }
  }

  handleCurrencyUpdate = (text, data, params) => {
    var addr = text.toLowerCase().replace(/\s/g, '');
    //Not sure if this \/ is the best way, but it handles the case
    //when both handleCurrencyUpdate and handleCurrencySubmit are called
    for (var idx in data) {
      var item = data[idx];
      if (item.textKey === text)
        return;
    }
    this.setState({ currency: addr, currencyName: addr });
    if (addr.length !== 42 || !isAddress(addr)) {
      this.setState({ currencyErrorMsg: 'Invalid ERC20 token address' });
      return;
    }
    this.instantiateERC20Contract(addr)
    .then(() => {
      var _name = _.clone(this.state.erc20Contracts[addr].name);
      this.setState({ currency: addr, currencyName: _name, currencyErrorMsg: ''});
    })
    .catch((err) => {
      this.setState({ currencyErrorMsg: 'Invalid ERC20 token address', currencyName: addr });
    });
  }

  /** Computes the real final gain, to be used by Withdraw
    */
  FinalGainEther = () => {
    return this.FinalGainByCurrency('');
  }

  FinalGainByCurrency = (addr) => {
    if (addr == '') {
      return computeFinalGain(this.state.hasBetOnTeamEther, this.state.team0BetSum, this.state.team1BetSum, this.state.currentBetState, this.state.TAX);
    }

    return computeFinalGain(this.state.ERC20HasBetOnTeam[addr], this.state.ERC20Team0BetSum[addr], this.state.ERC20Team1BetSum[addr], this.state.currentBetState, this.state.TAX);
  }

  CurrencyId = () => {
    if (this.state.currency === '')
      return 'Ξ';
    if (! (this.state.currency in this.state.erc20Contracts))
      return 'Ξ';
    //TODO: \/ maybe use entire symbol?
    return this.state.erc20Contracts[this.state.currency].name[0];
  }

  CurrencyAmount = (amount) => {
    var addr = this.state.currency;
    if (addr === '')
      return formatEth(amount);
    if (! (this.state.currency in this.state.erc20Contracts))
      return formatEth(amount);
 
    return formatToken(amount, this.state.erc20Contracts[addr].decimals);
  }

  CurrencyAmountTeam0 = () => {
    if (this.state.currency === '')
      return formatEth(this.state.team0BetSum);
    if (! (this.state.currency in this.state.erc20Contracts))
      return formatEth(this.state.team0BetSum);
 
    var erc20 = this.state.currency;
    if (erc20 in this.state.ERC20Team0BetSum)
      return formatToken(this.state.ERC20Team0BetSum[erc20], this.state.erc20Contracts[erc20].decimals);

    return formatToken(new BigNumber(0));
  }

  CurrencyAmountTeam1 = () => {
    if (this.state.currency === '')
      return formatEth(this.state.team1BetSum);
    if (! (this.state.currency in this.state.erc20Contracts))
      return formatEth(this.state.team1BetSum);
 
    var erc20 = this.state.currency;
    if (erc20 in this.state.ERC20Team1BetSum)
      return formatToken(this.state.ERC20Team1BetSum[erc20]);

    return formatToken(new BigNumber(0));
  }

  Currency = () => {
    return (
      <AutoComplete
        textFieldStyle={{width: 160}}
        style={{width: 160, marginLeft: 20, marginRight: 20}}
        floatingLabelText='Currency'
        searchText={this.state.currencyName}
        onNewRequest={this.handleCurrencySubmit}
        onUpdateInput={this.handleCurrencyUpdate}
        openOnFocus={true}
        dataSource={ERC20Tokens.erc20tokens()}
        dataSourceConfig={{ text: 'textKey', value: 'valueKey' }}
        filter={AutoComplete.noFilter}
        errorText={this.state.currencyErrorMsg}
      />
    );
  }

  FilteredBet = () => {
    const betTitle = 
      <div style={{display: 'flex', flexFlow: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
        <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white} style={{width: 100}}>
          <Avatar size={32} backgroundColor={MColors.cyan800}>{this.CurrencyId()}</Avatar>
          {this.CurrencyAmountTeam0()}
        </Chip>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200}}>
          <span style={{marginLeft: 10, marginRight: 10, fontWeight: 'normal', fontSize: 16}}>
            {this.state.team0Name}   x   {this.state.team1Name}
          </span>
        </div>
        <Chip backgroundColor={MColors.cyan500} labelColor={MColors.white} style={{width: 100}}>
          <Avatar size={32} backgroundColor={MColors.cyan800}>{this.CurrencyId()}</Avatar>
          {this.CurrencyAmountTeam1()}
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
          expanded={(this.props.isDetailed) ? true : this.state.isExpanded}
        >
        <CardHeader
          avatar={(this.state.iconUrl != null) ? 
                    this.state.iconUrl : <Avatar icon={<ImagePhotoCamera />} /> }
          title={betTitle}
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}
          showExpandableButton={(this.props.isDetailed) ? false : true}
        />
        <BetController
          isDetailed={this.props.isDetailed}
          betContractInstance={this.state.betContractInstance}
          address={this.props.address}
          currentBetState={this.state.currentBetState}
          team0Name={this.state.team0Name}
          team1Name={this.state.team1Name}
          stepperState={this.state.stepperState}
          isExpanded={(this.props.isDetailed) ? true : this.state.isExpanded}
          hasBetOnTeam={this.state.hasBetOnTeam}
          hasBetOnTeamEther={this.state.hasBetOnTeamEther}
          ERC20HasBetOnTeam={this.state.ERC20HasBetOnTeam}
          team0BetSum={this.state.team0BetSum}
          team1BetSum={this.state.team1BetSum}
          ERC20Team0BetSum={this.state.ERC20Team0BetSum}
          ERC20Team1BetSum={this.state.ERC20Team1BetSum}
          erc20Contracts={this.state.erc20Contracts}
          tax={this.state.TAX}
          betOnTeamFunction={this.betOnTeam.bind(this)}
          callArbiterFunction={this.callArbiter.bind(this)}
          callVoteFunction={this.callVote.bind(this)}
          withdrawFunction={this.withdraw.bind(this)}
          betHappened={this.state.betHappened}
          isArbiter={this.state.isArbiter}
          arbiterInfo={this.state.arbiterInfo}
          currency={this.state.currency}
          currencyIdFunction={this.CurrencyId.bind(this)}
          currencyAmountFunction={this.CurrencyAmount.bind(this)}
        />
        <this.BetStatusDialog />
        <this.WithdrawStatusDialog />
        <this.ApprovalStatusDialog />
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

  reflectERC20Fields(promise){
    return promise.promise.then(function(v){ return {f:promise.field, v:v, status: 'resolved' }},
                                function(e){ return {f:promise.field, e:e, status: 'rejected' }});
  }

  instantiateERC20Contract(address) {
    return new Promise((resolve, reject) => {
      if (address in this.state.erc20Contracts)
        resolve();

      const erc20Contract = contract(ERC20Json);
      erc20Contract.setProvider(this.context.web3.web3.currentProvider);
      var erc20Instance = erc20Contract.at(address);

      var _erc20Contracts = _.clone(this.state.erc20Contracts);
      var promises = [];
      erc20Instance.then(() => {
        for (var erc20_field in ERC20Fields)
          promises.push({field: erc20_field, promise: erc20Instance[erc20_field]()});
        return Promise.all(promises.map(this.reflectERC20Fields));
      })
      .then((results) => {
        var success = results.filter(x => x.status === 'resolved');
        var _erc20Contracts = _.clone(this.state.erc20Contracts);
        _erc20Contracts[address] = {instance: erc20Instance, decimals: new BigNumber(0), name: address, symbol: ''};
        for (var idx in success) {
          var field = success[idx];
          _erc20Contracts[address][field.f] = field.v;
        }
        this.setState({ erc20Contracts : _erc20Contracts});
        resolve();
      })
      .catch((err) => {
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
    arbiterContract.setProvider(this.context.web3.web3.currentProvider);
    betContract.setProvider(this.context.web3.web3.currentProvider);
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

    var stateObjects = await setAttributes(this.state, betContractInstance);
    try{
      stateObjects['iconUrl'] = require('assets/imgs/' + this.props.category + '.png');
    }
    catch(err) {
      stateObjects['iconUrl'] = null;
    }

    var isArbiter;
    var betsToTeam0;
    var betsToTeam1;
    var _ERC20Team0BetSum = {};
    var _ERC20Team1BetSum = {};
    var _ERC20HasBetOnTeam = {};

    if (this.context.web3.web3.eth.defaultAccount !== undefined) {
      isArbiter = await arbiterContractInstance.isMember(this.context.web3.web3.eth.defaultAccount);
      betsToTeam0 = await betContractInstance.betsToTeam0(this.context.web3.web3.eth.defaultAccount);
      betsToTeam1 = await betContractInstance.betsToTeam1(this.context.web3.web3.eth.defaultAccount);
    }
    else {
      betsToTeam0 = new BigNumber(0);
      betsToTeam1 = new BigNumber(0);
    }

    var _TAX = stateObjects['TAX'].dividedBy(100);

    var _validERC20 = [];
    var _valid = await betContractInstance.validERC20(0);
    var i = 1;
    var betToTeamERC20 = null;
    var amount = new BigNumber(0);
    while (_valid != '0x') {
      _valid = _valid.toLowerCase();
      _validERC20.push(_valid);

      await this.instantiateERC20Contract(_valid);

      try {
        _ERC20Team0BetSum[_valid] = await betContractInstance.ERC20Team0BetSum(_valid);
        _ERC20Team1BetSum[_valid] = await betContractInstance.ERC20Team1BetSum(_valid);
      } catch(e) {
        console.log('Error: ' + e);
      }

      if (this.context.web3.web3.eth.defaultAccount !== undefined ) {
        try {
          var bets0 = await betContractInstance.ERC20BetsToTeam0(_valid, this.context.web3.web3.eth.defaultAccount);
          var bets1 = await betContractInstance.ERC20BetsToTeam1(_valid, this.context.web3.web3.eth.defaultAccount);
          if (bets0.gt(0) || bets1.gt(0)) {
            if (bets0.gt(0)) {
              if (betToTeamERC20 === true)
                console.log('Error: user has bet on different teams using different currencies');
              betToTeamERC20 = false;
              amount = bets0;
            }
            else {
              if (betToTeamERC20 === false)
                console.log('Error: user has bet on different teams using different currencies');
              betToTeamERC20 = true;
              amount = bets1;
            }
            _ERC20HasBetOnTeam[_valid] = {team: betToTeamERC20, amount: amount};
          }
        } catch(e) {
          console.log('Error: ' + e);
        }
      }

      _valid = await betContractInstance.validERC20(i);
      i += 1;
    }

    const betToTeamEther = (betsToTeam0.greaterThan(new BigNumber(0))) ? false :
                             ((betsToTeam1.greaterThan(new BigNumber(0))) ? true : null);
 
    const betToTeam = (betToTeamEther !== null) ? betToTeamEther : betToTeamERC20;
    
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
      TAX: _TAX,
      hasBetOnTeam: betToTeam,
      hasBetOnTeamEther: {
        team: betToTeamEther,
        amount: (betToTeamEther === false) ? betsToTeam0 : 
                 (betToTeamEther === true) ? betsToTeam1 : new BigNumber(0)
      },
      ERC20HasBetOnTeam: _ERC20HasBetOnTeam,
      ERC20Team0BetSum: _ERC20Team0BetSum,
      ERC20Team1BetSum: _ERC20Team1BetSum,
      validERC20: _validERC20,
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
        console.log('bet');
        cancellationToken.throwIfCancelled();
        if (response.args.forTeam === false)
          this.setState(previousState => (
            { team0BetSum : previousState.team0BetSum.plus(response.args.amount)}));
        else
         this.setState(previousState => (
            { team1BetSum : previousState.team1BetSum.plus(response.args.amount)}));

        if (response.args.from === this.context.web3.web3.eth.defaultAccount) {
          this.setState(previousState => {
            if (previousState.hasBetOnTeam === null)
              previousState.hasBetOnTeam = response.args.forTeam;
            if (previousState.hasBetOnTeamEther.team === null)
              previousState.hasBetOnTeamEther = {
                team: response.args.forTeam,
                amount: response.args.amount
              };
            else
              previousState.hasBetOnTeamEther = {
                team: response.args.forTeam,
                amount: previousState.hasBetOnTeamEther.amount.add(response.args.amount)
              }
          });
        }
      }
      else if (response.event === 'NewBetERC20') {
        cancellationToken.throwIfCancelled();
        var _ERC20Team0BetSum = _.clone(this.state.ERC20Team0BetSum);
        var _ERC20Team1BetSum = _.clone(this.state.ERC20Team1BetSum);
        var erc20 = response.args.erc20.toLowerCase();
        var amount = response.args.amount;

        if (this.state.validERC20.indexOf(erc20) === -1) {
          var _valid = _.clone(this.state.validERC20);
          _valid.push(erc20);
          this.setState({ validERC20 : _valid });
          _ERC20Team0BetSum[erc20] = new BigNumber(0);
          _ERC20Team1BetSum[erc20] = new BigNumber(0);
        }

        if (response.args.forTeam === false) {
          _ERC20Team0BetSum[erc20] = _ERC20Team0BetSum[erc20].plus(amount);
          this.setState({ ERC20Team0BetSum : _ERC20Team0BetSum });
        }
        else {
          _ERC20Team1BetSum[erc20] = _ERC20Team1BetSum[erc20].plus(amount);
          this.setState({ ERC20Team1BetSum : _ERC20Team1BetSum });
        }

        if (response.args.from === this.context.web3.web3.eth.defaultAccount) {
          var _hasBetOnTeam = _.clone(this.state.hasBetOnTeam);
          if (_hasBetOnTeam === null)
            _hasBetOnTeam = response.args.forTeam;
          var _ERC20HasBetOnTeam = _.clone(this.state.ERC20HasBetOnTeam);
          if (erc20 in _ERC20HasBetOnTeam) {
            _ERC20HasBetOnTeam[erc20] = { team: response.args.forTeam, amount: _ERC20HasBetOnTeam[erc20].amount.add(amount) };
          }
          else {
            _ERC20HasBetOnTeam[erc20] = { team: response.args.forTeam, amount: (new BigNumber(amount)) };
          }
          this.setState({ hasBetOnTeam : _hasBetOnTeam,
                          ERC20HasBetOnTeam : _ERC20HasBetOnTeam });
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
      if (this.state.hasBetOnTeam !== null)
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
            if (result[betEvent].args.from === this.context.web3.web3.eth.defaultAccount) {
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
