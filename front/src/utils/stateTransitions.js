/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import {stepperState, contractStates, betState, betTimeStates} from './betStates';

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
      newStepperState = stepperState.payout;
    }
    else if (currentState === contractStates.TEAM_ONE_WON) {
      newOverAllState = betState.team1Won;
      newStepperState = stepperState.payout;
    }
    else if (currentState === contractStates.DRAW) {
      newOverAllState = betState.draw;
      newStepperState = stepperState.payout;
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
  },

  fromTimerStateToCurrentState : (currentState, timerState) => {
    var newState = null;
    if (timerState === betTimeStates.matchOpen) {
      if (currentState !== betState.matchOpen)
        newState = {
          currentBetState: betState.matchOpen,
          stepperState: stepperState.matchOpen
        };
    }
    else if (timerState === betTimeStates.matchRunning) {
      if (currentState === betState.matchOpen)
        newState = {
          currentBetState: betState.matchRunning,
          stepperState: stepperState.matchRunning
        };
    }
    else if (timerState === betTimeStates.matchEnded) {
      if ((currentState !== betState.calledArbiter) &&
          (currentState !== betState.draw) &&
          (currentState !== betState.team0Won) &&
          (currentState !== betState.team1Won) &&
          (currentState !== betState.arbiterUndecided) &&
          (currentState !== betState.shouldCallArbiter))
        newState = {
          currentBetState: betState.shouldCallArbiter,
          stepperState: stepperState.matchEnded
        };
    }
    else if (timerState === betTimeStates.matchExpired) {
      if ((currentState !== betState.draw) &&
          (currentState !== betState.team0Won) &&
          (currentState !== betState.team1Won) &&
          (currentState !== betState.arbiterUndecided) &&
          (currentState !== betState.betExpired))
      newState = {
        currentBetState: betState.betExpired,
        stepperState: stepperState.matchEnded
      };
    }
    else if (timerState === betTimeStates.matchDestruct) {
      newState = {
        currentBetState: betState.betTerminate,
        stepperState: stepperState.matchEnded
      };
    }
    return newState;
  }
};
export default stateTransitionFunctions;
