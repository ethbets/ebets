/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

/*global web3:true */
import moment from 'moment';

import PropTypes from 'prop-types';
import EthereumBlockies from 'ethereum-blockies';
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import * as MColors from 'material-ui/styles/colors';
import LinkIcon from 'material-ui/svg-icons/content/link';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import {formatEth} from 'utils/ethUtils';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';

import {betState, stepperState} from 'utils/betStates';
import Arbiters from 'components/Arbiters';

class BetController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTeam: null,
      amountToBet: new BigNumber(0),
      isArbiter: false,
      betList: [],
      allBetEvents: null
    }
  }

  componentWillMount() {
    if (this.props.isDetailed) {
      var allBetEvents = this.props.betContractInstance.allEvents({
      fromBlock: 0,
      toBlock: 'latest'});
      this.setState({allBetEvents: allBetEvents});
      //this.setState({myBetsFilter: filter});
      allBetEvents.watch((error, result) => {
        if (result.event === 'NewBet') {
          web3.eth.getBlock(result.blockNumber, (err, block) => {
            this.setState(previousState => {
              const newBet = {
                from: result.args.from,
                amount: result.args.amount,
                forTeam: result.args.forTeam,
                timestamp: block.timestamp
              };
              previousState.betList.push(newBet);
              previousState.betList.sort((A, B) => A.timestamp < B.timestamp);
            });
          });
        }
      });
    }
  }
  componentWillUnmount() {
    if (this.state.allBetEvents)
      this.state.allBetEvents.stopWatching();
  }

  setTeam = (event, index, value) => {
    this.setState({selectedTeam: value});
  };

  setBetValue = (event, newValue) => {
    if (newValue !== '')
      this.setState({amountToBet : new BigNumber(newValue)});
  };

  Steps = () => {
    var BetDecision = () => {
      if (this.props.currentBetState <= betState.shouldCallArbiter || 
        this.props.currentBetState === betState.calledArbiter)
        return 'Result';
      else if (this.props.currentBetState === betState.team0Won)
        return `${this.props.team0Name} won`;
      else if (this.props.currentBetState === betState.arbiterUndecided)
        return 'Undecided';
      else if (this.props.currentBetState === betState.team1Won)
        return `${this.props.team1Name} won`;
      else if (this.props.currentBetState === betState.draw)
        return 'Draw';
      return null;
    };
    var CallArbiterName = () => {
      if (this.props.currentBetState === betState.calledArbiter)
        return 'Called Arbiter';
      else
        return 'Call Arbiter';
    };
    
    // TODO: I don't think BetDecision() works
    // TODO: Change Call Arbiter to Arbiter Called when the arbiter is called
    return (
        <Stepper activeStep={this.props.stepperState}>
          <Step>
            <StepLabel>Place your bet!</StepLabel>
          </Step>
          <Step>
            <StepLabel>Match running</StepLabel>
          </Step>
          <Step>
            <StepLabel>{CallArbiterName()}</StepLabel>
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
  
  DynamicBetButton = () => {
    if (this.props.currentBetState === betState.shouldCallArbiter ||
        this.props.currentBetState === betState.calledArbiter) {
      return (
      <RaisedButton
        disabled={this.props.currentBetState === betState.calledArbiter}
        secondary={true}
        className="betBtn"
        onTouchTap={() => this.props.callArbiterFunction()}
      ><span>Call Arbiter</span>
      </RaisedButton>
      )
    }
    else if ((this.props.currentBetState >= betState.team0Won &&
              this.props.currentBetState <= betState.draw) ||
              this.props.stepperState === stepperState.payout) {
      //var gain = this.FinalGain();
      var gain = this.GainByCurrency();
      return (
      <RaisedButton 
        className="betBtn"
        primary={true}
        onTouchTap={() => this.props.withdrawFunction()}
        disabled={(this.props.stepperState !== stepperState.payout)}
      ><span>Withdraw Ξ{gain.toString()}</span>
      </RaisedButton>
      )
    }
    return (
      <RaisedButton 
        disabled={(this.props.currentBetState !== betState.matchOpen)}
        primary={true}
        label='Bet'
        onTouchTap={() => this.props.betOnTeamFunction(
          (this.props.hasBetOnTeam.team !== null) ? this.props.hasBetOnTeam.team 
          : this.state.selectedTeam , 
          new BigNumber(this.state.amountToBet))}
      />
      )
  }

  ArbiterExpandedMatch = () => {
    return (
      <div>
        <span style={{marginRight: 15, marginLeft: 15}}>
          Who won the match?
        </span>
        <SelectField style={{ width: 160 }} className='test'
          floatingLabelText='Team'
          value={this.state.selectedTeam}
          onChange={this.setTeam}
          disabled={this.props.currentBetState !== betState.calledArbiter}
        >
          <MenuItem value={1} primaryText={this.props.team0Name} />
          <MenuItem value={2} primaryText={this.props.team1Name} />
          <MenuItem value={3} primaryText='Draw' />
        </SelectField>
        <RaisedButton
          disabled={this.props.currentBetState !== betState.calledArbiter}
          secondary={true}
          className="betBtn"
          onTouchTap={() => this.props.callVoteFunction(this.state.selectedTeam)}
        ><span>Vote</span>
        </RaisedButton>
      </div>
    );
  }

  ComputeGain = (amount, winnerPool, loserPool, tax) => {
    var profit = amount.dividedBy(winnerPool).times(loserPool);
    if (profit.gt(0))
      profit = profit.minus(profit.times(new BigNumber(tax)))
    return amount.plus(profit);
  }

  ExpectedGain = () => {
    var expectedIncome;
    var amount;
    var winnerPool;
    var loserPool;
    var tax = new BigNumber(this.props.tax);
    tax = tax.dividedBy(100);

    if (this.state.selectedTeam === null || this.props.currentBetState !== betState.matchOpen)
      return null;

    if (this.state.amountToBet.lessThan(new BigNumber(0)))
      return null;

    amount = this.state.amountToBet.times(new BigNumber('1000000000000000000'));
    if (this.state.selectedTeam === false) {
      loserPool = this.props.team1BetSum;
      winnerPool = this.props.team0BetSum;
    }
    else {
      loserPool = this.props.team0BetSum;
      winnerPool = this.props.team1BetSum;
    }
    winnerPool = winnerPool.plus(amount);
    expectedIncome = this.ComputeGain(amount, winnerPool, loserPool, tax);

    if (amount.isZero(0) || isNaN(amount))
      return null;
    else
      return (
      <Chip backgroundColor={MColors.yellow500}>
        <Avatar size={32} backgroundColor={MColors.yellow800}>Ξ</Avatar>
        Win {formatEth(expectedIncome)}
      </Chip>
      );
  }

  GainByCurrency = () => {
    if (this.props.currency.address == '') {
      return this.FinalGain(this.props.hasBetOnTeam, this.props.team0BetSum, this.props.team1BetSum);
    }

    var addr = this.props.currency.address;
    return this.FinalGain(this.props.ERC20HasBetOnTeam[addr], this.props.ERC20Team0BetSum[addr], this.props.ERC20Team1BetSum[addr]);
  }

  FinalGain = (hasBetOnTeam, team0BetSum, team1BetSum) => {
    var winnerPool;
    var loserPool;
    var amount;
    var tax = new BigNumber(this.props.tax);
    tax = tax.dividedBy(100);

    if (this.props.currentBetState < betState.team0Won || this.props.currentBetState > betState.draw)
      return new BigNumber(0);

    //if (this.props.hasBetOnTeam.team === null)
    if (hasBetOnTeam.team === null)
      return new BigNumber(0);

    amount = hasBetOnTeam.amount;
    if (this.props.currentBetState === betState.draw)
      return amount;

    var hasBetTeam0 = !hasBetOnTeam.team;
    var hasBetTeam1 = hasBetOnTeam.team;
    //var team0BetSum = this.props.team0BetSum;
    //var team1BetSum = this.props.team1BetSum;

    if ((this.props.currentBetState === betState.team0Won && hasBetTeam1) ||
        (this.props.currentBetState === betState.team1Won && hasBetTeam0))
      return new BigNumber(0);

    if (this.props.currentBetState === betState.team0Won) {
      winnerPool = team0BetSum;
      loserPool = team1BetSum;
    }
    else if (this.props.currentBetState === betState.team1Won) {
      winnerPool = team1BetSum;
      loserPool = team0BetSum;
    }
    return this.ComputeGain(amount, winnerPool, loserPool, tax);
  }

  DynamicList = () => {
    if (!this.props.isDetailed)
      return null;
    return (
      <div>
        <h3 style={{textAlign: 'center'}}>Bets history</h3>
        <Table selectable={false} height='300px'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn colSpan='2'>Address</TableHeaderColumn>
              <TableHeaderColumn>Amount</TableHeaderColumn>
              <TableHeaderColumn>For Team</TableHeaderColumn>
              <TableHeaderColumn>At</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.state.betList.map((bet, index) => {
              const imgURL = EthereumBlockies.create({
                seed: bet.from.toLowerCase(),
                spotcolor: -1,
                size: 8,
                scale: 4,
              }).toDataURL();
              
              return (
                <TableRow key={index}>
                  <TableRowColumn colSpan='2' ><img src={"data:image/jpeg;" + imgURL} />{bet.from}</TableRowColumn>
                  <TableRowColumn>{formatEth(bet.amount)}</TableRowColumn>
                  <TableRowColumn>{(bet.forTeam) ? this.props.team1Name : this.props.team0Name}</TableRowColumn>
                  <TableRowColumn>{moment(bet.timestamp*1e3).format('LLL')}</TableRowColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    if (this.props.isExpanded) {
      /*
       * Arbiters can vote on the match's outcome
       */
      if (this.props.isArbiter) {
        return <this.ArbiterExpandedMatch />
      }
      const ArbiterInfo =  Arbiters.getArbiterInfo(this.props.arbiterInfo);
      return (
        <div>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end'}}>
            <ArbiterInfo />
            <SelectField style={{ width: 160,
                                  marginRight: 10,
                                  marginLeft: 10 }}
              floatingLabelText='Team'
              value={(this.props.hasBetOnTeam.team !== null) ? this.props.hasBetOnTeam.team : this.state.selectedTeam}
              onChange={this.setTeam}
              disabled={this.props.hasBetOnTeam.team !== null || this.props.currentBetState >= betState.matchRunning}
            >
              <MenuItem value={false} primaryText={this.props.team0Name} />
              <MenuItem value={true} primaryText={this.props.team1Name} />
            </SelectField>
            <TextField
              disabled={(this.props.currentBetState >= betState.matchRunning)}
              style={{ width: 80, marginRight: 10 }}
              hintText='Value'
              id='betAmount'
              type='number'
              onChange={this.setBetValue}
              />
            <this.DynamicBetButton />
            {(!this.props.isDetailed) ? <RaisedButton
              style={{marginLeft: 14}}
              href={`#bet/${this.props.address}`}
              label='Permalink'
              primary={true}
              icon={<LinkIcon />}
            /> : null}
            <this.ExpectedGain />
          </div>
          <this.Steps />
          <this.DynamicList />
        </div>
      )
    }
    return null;
  }
}

BetController.contextTypes = {
  web3: PropTypes.object
};

export default BetController;
