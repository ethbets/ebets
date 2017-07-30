import {stepperState, contractStates, betState} from './betStates';

const stateTransitionFunctions = {
  fromBetStateToCurrentState: (currentState, hasBetOnTeam) => {
    var newOverAllState;
    var newStepperState;
    if (currentState === contractStates.OPEN) {
        newOverAllState = betState.matchOpen;
        newStepperState = stepperState.matchOpen
    }
    else if (currentState === contractStates.TEAM_ZERO_WON) {
      newOverAllState = betState.team0Won;
      if (hasBetOnTeam === false)
        newStepperState = stepperState.payout;
      else
        newStepperState = stepperState.matchDecision;
    }
    else if (currentState === contractStates.TEAM_ONE_WON) {
      newOverAllState = betState.team1Won;
      if (hasBetOnTeam === true)
        newStepperState = stepperState.payout;
      else
        newStepperState = stepperState.matchDecision;
    }
    else if (currentState === contractStates.DRAW) {
      newOverAllState = betState.draw;
      if (hasBetOnTeam !== null)
        newStepperState = stepperState.payout;
      else
        newStepperState = stepperState.matchDecision;
    }
    else if (currentState === contractStates.UNDECIDED) {
      newOverAllState = betState.arbiterUndecided;
      newStepperState = stepperState.matchDecision;
    }
    else if (currentState === contractStates.CALLED_RESOLVER) {
      newOverAllState = betState.calledArbiter;
      newStepperState = stepperState.matchEnded;
    }
    return { newOverAllState: newOverAllState, newStepperState: newStepperState };
  }
};
export default stateTransitionFunctions;