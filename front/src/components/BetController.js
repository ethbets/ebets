import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import * as MColors from 'material-ui/styles/colors';

import { RaisedButton, FlatButton } from 'material-ui'
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import {betState, stepperState} from './betStates';

class BetController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTeam: null,
      amountToBet: 0
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
    var CallArbiter = () => {
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
            <StepLabel>{CallArbiter()}</StepLabel>
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
        onTouchTap={this.callArbiter}
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
        onTouchTap={this.betOnTeam}
        disabled={(this.props.stepperState === stepperState.payout) || (gain <= 0)}
      ><span>Withdraw Ξ{gain}</span>
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

  ComputeGain = (amount, winnerPool, loserPool, tax) => {
    var profit = (amount / winnerPool) * loserPool;
    if (profit > 0)
      profit -= profit * tax;
    return (amount + profit);
  }

  ExpectedGain = () => {
    console.log(this.props.hasBetTeam0);
    var expectedIncome;
    var amount;
    var winnerPool;
    var loserPool;
    const tax = 0.1; //FIXME get from contract

    if (this.state.selectedTeam === null || this.props.currentBetState !== betState.matchOpen)
      return null;

    amount = this.state.amountToBet;
    if (this.state.selectedTeam === false) {
      loserPool = this.props.team1BetSum;
      winnerPool = this.props.team0BetSum;
    }
    else {
      loserPool = this.props.team0BetSum;
      winnerPool = this.props.team1BetSum;
    }
    winnerPool += amount;
    expectedIncome = this.ComputeGain(amount, winnerPool, loserPool, tax);

    if (amount === 0 || isNaN(amount))
      return null;
    else
      return (
      <Chip backgroundColor={MColors.yellow500}>
        <Avatar size={32} backgroundColor={MColors.yellow800}>Ξ</Avatar>
        Win {parseFloat(expectedIncome).toFixed(2)}
      </Chip>
      );
  }

  FinalGain = () => {
    var amount;
    var winnerPool;
    var loserPool;
    const tax = 0.1; //FIXME get from contract

    if (this.props.currentBetState < betState.team0Won || this.props.currentBetState > betState.draw)
      return 0;

    var hasBetTeam0 = this.props.hasBetTeam0;
    var hasBetTeam1 = this.props.hasBetTeam1;
    var team0BetSum = this.props.team0BetSum;
    var team1BetSum = this.props.team1BetSum;

    if ((hasBetTeam0 === undefined || hasBetTeam0 <= 0) &&
        (hasBetTeam1 === undefined || hasBetTeam1 <= 0))
      return 0;

    if (this.props.currentBetState === betState.draw) {
      if (hasBetTeam0 === undefined || hasBetTeam1 <= 0)
        amount = hasBetTeam1;
      else
        amount = hasBetTeam0;
      return amount;
    }

    if (this.props.currentBetState === betState.team0Won) {
      if (hasBetTeam0 === undefined || hasBetTeam0 <= 0)
        return 0;
      amount = hasBetTeam0;
      winnerPool = team0BetSum;
      loserPool = team1BetSum;
    }
    else { // if (this.props.currentBetState === betState.team1Won)
      if (hasBetTeam1 === undefined || hasBetTeam1 <= 0)
        return 0;
      amount = hasBetTeam1;
      winnerPool = team1BetSum;
      loserPool = team0BetSum;
    }
    return this.ComputeGain(amount, winnerPool, loserPool, tax);
  }

  render() {
    if (this.props.isExpanded) {
    return <div>
        <div className='betRow'>
        <SelectField style={{ width: 160 }} className='test'
          floatingLabelText='Team'
          value={(this.props.betOnTeam !== null) ? this.props.betOnTeam : this.state.selectedTeam}
          onChange={this.setTeam}
          disabled={this.props.betOnTeam !== null || this.props.currentBetState >= betState.matchRunning}
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
        </div>
        <this.Steps />
      </div>
    }
    return null;
  }
}

export default BetController;
