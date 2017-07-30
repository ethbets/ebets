import {stepperState, contractStates} from '../components/betStates';

const stateTransitionFunctions = {
  fromBetStateToCurrentState: (betState, hasBetOnTeam) => {
    var newOverAllState;
    var newStepperState;
    if (betState === contractStates.OPEN) {
        newOverAllState = betState.matchOpen;
        newStepperState = stepperState.matchOpen
    }
    else if (betState === contractStates.TEAM_ZERO_WON) {
      newOverAllState = betState.team0Won;
      if (hasBetOnTeam !== null)
        newStepperState = stepperState.payout;
    }
    else if (betState === contractStates.TEAM_ONE_WON) {
      newOverAllState = betState.team1Won;
      if (hasBetOnTeam !== null)
        newStepperState = stepperState.payout;
    }
    else if (betState === contractStates.DRAW) {
      newOverAllState = betState.draw;
      if (hasBetOnTeam !== null)
        newStepperState = stepperState.payout;
    }
    else if (betState === contractStates.UNDECIDED) {
      newOverAllState = betState.arbiterUndecided;
      newStepperState = stepperState.matchDecision;
    }
    else if (betState === contractStates.CALLED_RESOLVER) {
      newOverAllState = betState.calledArbiter;
      newStepperState = stepperState.matchEnded;
    }
    return { newOverAllState: newOverAllState, newStepperState: newStepperState };
  }
};
export default stateTransitionFunctions;