const BETSTATES = {
  betTimeStates : {
    matchOpen: 0,
    matchRunning: 1,
    matchEnded: 2,
    matchExpired: 3,
    matchDestruct: 4,
    TIMESTAMP_MARGIN: 1000
  },

  contractStates : {
    OPEN: 0,
    TEAM_ZERO_WON: 1,
    TEAM_ONE_WON: 2,
    DRAW: 3,
    UNDECIDED: 4,
    CALLED_RESOLVER: 5
  },

  /* 0: Match not started
     * 1: Match running
     * 2: Should Call Oracle
     * 3: Oracle Undecided
     * 4: Team 0 won
     * 5: Team 1 won
     * 6: Draw
     * 7: Bet Expired
     * 8: Can withdraw
  */
  betState: {
    matchOpen: 0,
    matchRunning: 1,
    shouldCallArbiter: 2,
    arbiterUndecided: 3,
    team0Won: 4,
    team1Won: 5,
    draw: 6,
    betExpired: 7,
    calledArbiter: 8,
    betTerminate: 9,
  },
  stepperState: {
    matchOpen: 0,
    matchRunning: 1,
    matchEnded: 2,
    matchDecision: 3,
    payout: 4
  }
}

module.exports = {...BETSTATES};