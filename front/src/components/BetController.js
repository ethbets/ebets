import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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
      if (this.props.currentBetState <= betState.shouldCallArbiter)
        return 'Wait Arbiter';
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
            <StepLabel>Call Arbiter</StepLabel>
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
    else if (this.props.stepperState === stepperState.payout)
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
        disabled={(this.props.currentBetState !== betState.matchOpen)}
        className="betBtn"
        primary={true}
        onTouchTap={() => this.props.betOnTeamFunction(this.state.selectedTeam, this.state.amountToBet)}
      ><span>Bet</span>
      </RaisedButton>
      )
  }
  
    ExpectedGain = () => {
      var expectedIncome;
      var amount;
      var winnerPool;
      var loserPool;

      if (this.state.selectedTeam === null)
        return null;

      if (this.state.selectedTeam === false) {
        amount = this.state.amountToBet;
        expectedIncome = this.state.amountToBet;
        loserPool = this.props.team1BetSum - 0.02*this.props.team1BetSum;
        winnerPool = expectedIncome + this.props.team0BetSum;
      }
      else {
        amount = this.state.amountToBet;
        expectedIncome = this.state.amountToBet;
        loserPool = this.props.team0BetSum - 0.02*this.props.team0BetSum;
        winnerPool = expectedIncome + this.props.team1BetSum;
      }
    
      expectedIncome +=  (expectedIncome/winnerPool)*loserPool;
      if (amount === 0 || isNaN(amount))
        return null
      else
        return <RaisedButton backgroundColor='#FAD723'>
          Win Ξ{parseFloat(expectedIncome).toFixed(2)}
        </RaisedButton>
    }

  render() {
    if (this.props.isExpanded) {
    return <div>
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
        <this.Steps />
      </div>
    }
    return null;
  }
}

export default BetController;