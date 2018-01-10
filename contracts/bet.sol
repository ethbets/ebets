/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;

import './teamBet.sol';
import './governance/governanceInterface.sol';
import './betlib.sol';

contract Bet is ProposalInterface {
  modifier onlyArbiter() {
    require(msg.sender == address(arbiter));
    _;
  }
  modifier beforeTimestamp(uint timestamp) {
    require(block.timestamp < timestamp);
    _;
  }
  modifier afterTimestamp(uint timestamp) {
    require(block.timestamp >= timestamp);
    _;
  }
  modifier matchIsOpenOrUndecided() {
    require(betState == BET_STATES.OPEN || betState == BET_STATES.UNDECIDED);
    _;
  }
  modifier matchIsDecided() {
    require(betState == BET_STATES.TEAM_ZERO_WON || 
            betState == BET_STATES.TEAM_ONE_WON ||
            betState == BET_STATES.DRAW);
    _;
  }
  modifier matchIsNotDecided() {
    require(betState != BET_STATES.TEAM_ZERO_WON &&
            betState != BET_STATES.TEAM_ONE_WON &&
            betState != BET_STATES.DRAW);
    _;
  }

  enum BET_STATES {
    OPEN,
    TEAM_ZERO_WON,
    TEAM_ONE_WON,
    DRAW,
    UNDECIDED,
    CALLED_RESOLVER
  }
  
  TeamBet public team0;
  TeamBet public team1;

  // Governance account
  GovernanceInterface public arbiter;
  // Bet State
  BET_STATES public betState = BET_STATES.OPEN;
  
  // Chronology data
  // Match begin
  uint public timestampMatchBegin;
  // Match end
  uint public timestampMatchEnd;
  // Arbiter must vote until
  uint public timestampArbiterDeadline;
  // Appeals can be made (withdraw can be made after that time only)
  uint public timestampAppealsDeadline;
  // Self-destruct is possible if time > timestampSelfDestructDeadline
  uint public timestampSelfDestructDeadline;

  uint8 public ARBITER_TAX;
  uint constant TIMESTAMP_MARGIN = 1000;

  event StateChanged(BET_STATES state);
  event Withdraw(address winner, uint amount);

  function Bet(GovernanceInterface _arbiter, string _team0Name, 
               string _team1Name, uint[] _timestamps, uint8 _tax
               ) public {
    require(block.timestamp < _timestamps[0]);
    require(_timestamps[0] < _timestamps[1]);
    require(_timestamps[1] < _timestamps[2]);
    require(_timestamps[2] < _timestamps[3]);
    require(_timestamps[3] < _timestamps[4]);

    arbiter = _arbiter;
    
    team0 = new TeamBet(_team0Name);
    team1 = new TeamBet(_team1Name);
    // TODO: PUT BACK TIMESTAMP_MARGIN SUMS
    timestampMatchBegin = _timestamps[0];// - TIMESTAMP_MARGIN;
    timestampMatchEnd = _timestamps[1];// + TIMESTAMP_MARGIN;
    timestampArbiterDeadline = _timestamps[2];// + TIMESTAMP_MARGIN;
    timestampAppealsDeadline = _timestamps[3];// + TIMESTAMP_MARGIN;
    timestampSelfDestructDeadline = _timestamps[4];// + TIMESTAMP_MARGIN;
    ARBITER_TAX = _tax;
  }

  function __resolve(uint outcome) public
    onlyArbiter()
    afterTimestamp(timestampMatchEnd)
    beforeTimestamp(timestampArbiterDeadline) {
    require(betState == BET_STATES.CALLED_RESOLVER);
    if (outcome == 1)
      betState = BET_STATES.TEAM_ZERO_WON;
    else if (outcome == 2)
      betState = BET_STATES.TEAM_ONE_WON;
    else if (outcome == 3)
      betState = BET_STATES.DRAW;
    else
      betState = BET_STATES.UNDECIDED;
    StateChanged(betState);
  }

  // Will create a Proposal on the arbiter
  function updateResult() public
    matchIsOpenOrUndecided()
    afterTimestamp(timestampMatchEnd) {
    betState = BET_STATES.CALLED_RESOLVER;
    StateChanged(betState);
    //arbiter.getName();
    arbiter.addProposal(this, timestampArbiterDeadline);
  }
  // team = 0 : team 0
  // team = 1 : team 1
  function withdraw(address winner, bool team) public
    afterTimestamp(timestampAppealsDeadline) {
    uint profit = 0;
    if (betState == BET_STATES.DRAW) {
      if (team == false)
        profit = team0.getOriginalBet(winner);
      else
        profit = team1.getOriginalBet(winner);
    }
    else if (betState == BET_STATES.TEAM_ZERO_WON) {
      profit = team0.getOriginalBet(winner);
      profit += team1.collectProfit(winner, team0.betSum(), profit, ARBITER_TAX);
    }
    else if (betState == BET_STATES.TEAM_ONE_WON) {
      profit = team1.getOriginalBet(winner);
      profit += team0.collectProfit(winner, team1.betSum(), profit, ARBITER_TAX);
    }
    Withdraw(winner, profit);
  }

  /* After the arbiter appeals deadline and before the self-destruct
   * deadline, anyone can set the bet state to DRAW.
   * this is in the unlikely event if the arbiter don't
   * decide in time, every one can collect the funds.
  */
  function close() public
    afterTimestamp(timestampAppealsDeadline)
    beforeTimestamp(timestampSelfDestructDeadline) 
    matchIsNotDecided() {
      betState = BET_STATES.DRAW;
      StateChanged(betState);
  }

  /* Selfdestructs the bet and return what it has in the account
   * as a fee to the bet's arbiter.
   */
  function terminate() public
    afterTimestamp(timestampSelfDestructDeadline) {
    team0.collectBet();
    team1.collectBet();
    arbiter.collectFee.value(this.balance)();
    assert(this.balance == 0);
    selfdestruct(arbiter);
  }

  /* Fallback just throws now
   * Can do something, maybe increase the value of both pools
  */
  function () public { require(false); }
}
