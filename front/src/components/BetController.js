import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import DoneIcon from 'material-ui/svg-icons/action/done';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500, greenA200} from 'material-ui/styles/colors';

import * as MColors from 'material-ui/styles/colors';

import RaisedButton from 'material-ui/RaisedButton'
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import {betState, stepperState} from 'utils/betStates';

class BetController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTeam: null,
      amountToBet: 0,
      isArbiter: false
    }
  }

  setTeam = (event, index, value) => {
    this.setState({selectedTeam: value});
  };

  setBetValue = (event, newValue) => {
    this.setState({amountToBet : parseInt(newValue)});
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
      var gain = this.FinalGain();
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
        className="betBtn"
        primary={true}
        onTouchTap={() => this.props.betOnTeamFunction(this.state.selectedTeam, this.state.amountToBet)}
      ><span>Bet</span>
      </RaisedButton>
      )
  }

  ArbiterExpandedMatch = () => {
    return (
      <div className='betRow'>
        <div>
          Who won the match?
        </div>
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

    if (this.state.amountToBet <= 0)
      return null;

    amount = new BigNumber(this.state.amountToBet);
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
        Win {parseFloat(expectedIncome.toString()).toFixed(2)}
      </Chip>
      );
  }

  FinalGain = () => {
    var amount;
    var winnerPool;
    var loserPool;
    var tax = new BigNumber(this.props.tax);
    tax = tax.dividedBy(100);

    if (this.props.currentBetState < betState.team0Won || this.props.currentBetState > betState.draw)
      return new BigNumber(0);

    if (this.props.hasBetOnTeam === null)
      return new BigNumber(0);

    amount = this.props.hasBetOnTeam.amount;
    if (this.props.currentBetState === betState.draw)
      return amount;

    var hasBetTeam0 = !this.props.hasBetOnTeam.team;
    var hasBetTeam1 = this.props.hasBetOnTeam.team;
    var team0BetSum = this.props.team0BetSum;
    var team1BetSum = this.props.team1BetSum;

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

  ArbiterInfo = () => {
    var badgeContent;
    if (this.props.arbiterInfo.verified)
      badgeContent = <IconButton tooltip='Verified!'><DoneIcon color={greenA200}/></IconButton>
    else
      badgeContent = <IconButton tooltip='Not verified'><WarningIcon color={red500}/></IconButton>
    return (
      <div>
        <Badge
          badgeContent={badgeContent}
        >
        Using arbiter {this.props.arbiterInfo.name}
        </Badge>
    </div>
    )
  }

  render() {
    if (this.props.isExpanded) {
      /*
       * Arbiters can vote on the match's outcome
       */
      if (this.props.isArbiter) {
        return <this.ArbiterExpandedMatch />
      }
      return (
        <div>
          <div className='betRow'>
          <SelectField style={{ width: 160 }} className='test'
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
            style={{ width: 80 }}
            id='betAmount' 
            type='number'
            onChange={this.setBetValue}
            />
          <this.DynamicBetButton />
          <this.ExpectedGain/>
          <this.ArbiterInfo/>
          </div>
          <this.Steps />
        </div>
      )
    }
    return null;
  }
}

export default BetController;
