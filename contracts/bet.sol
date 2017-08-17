/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;

import './ERC20.sol';
import './governanceInterface.sol';

contract Bet is ProposalInterface {

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
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

  enum BET_STATES {
    OPEN,
    TEAM_ZERO_WON,
    TEAM_ONE_WON,
    DRAW,
    UNDECIDED,
    CALLED_RESOLVER
  }
 
  address public owner; // Can be a parent contract
  GovernanceInterface public arbiter; // Governance account

  // Bet data
  BET_STATES public betState = BET_STATES.OPEN;
  bool public isFeatured;
  string public team0Name;
  string public team1Name;
  uint public team0BetSum;
  uint public team1BetSum;
  mapping (address => uint) public betsToTeam0;
  mapping (address => uint) public betsToTeam1;

  // ERC20 support
  mapping (address => mapping (address => uint)) public ERC20BetsToTeam0;
  mapping (address => mapping (address => uint)) public ERC20BetsToTeam1;
  mapping (address => uint) public ERC20Team0BetSum;
  mapping (address => uint) public ERC20Team1BetSum;
  address[] public validERC20;

  // Chronology data
  uint public timestampMatchBegin;
  uint public timestampMatchEnd;
  uint public timestampArbiterDeadline;
  // Self-destruct is possible if time > timestampSelfDestructDeadline
  uint public timestampSelfDestructDeadline;

  uint8 public constant TAX = 10;
  uint constant TIMESTAMP_MARGIN = 1000;

  event NewBet(bool forTeam, address indexed from, uint amount);
  event NewBetERC20(bool forTeam, address indexed from, uint amount, address erc20);
  event StateChanged(BET_STATES state);

  function Bet(GovernanceInterface _arbiter, string _team0Name, 
               string _team1Name, uint[] _timestamps
               ) {
    require(block.timestamp < _timestamps[0]);
    require(_timestamps[0] < _timestamps[1]);
    require(_timestamps[1] < _timestamps[2]);
    require(_timestamps[2] < _timestamps[3]);

    isFeatured = false;
    owner = msg.sender;
    arbiter = _arbiter;
    team0Name = _team0Name;
    team1Name = _team1Name;
    // TODO: PUT BACK TIMESTAMP_MARGIN SUMS, PUT REQUIRES!
    timestampMatchBegin = _timestamps[0];// - TIMESTAMP_MARGIN;
    timestampMatchEnd = _timestamps[1];// + TIMESTAMP_MARGIN;
    timestampArbiterDeadline = _timestamps[2];// + TIMESTAMP_MARGIN;
    timestampSelfDestructDeadline = _timestamps[3];// + TIMESTAMP_MARGIN;
  }

  function __resolve(uint outcome)
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
  function updateResult() payable
    matchIsOpenOrUndecided()
    afterTimestamp(timestampMatchEnd) {
    require(betState != BET_STATES.CALLED_RESOLVER);
    betState = BET_STATES.CALLED_RESOLVER;
    StateChanged(betState);
    arbiter.addProposal(this, timestampArbiterDeadline);
  }
  
  function toggleFeatured() onlyOwner() {
    isFeatured = !isFeatured;
  }

  function bet(bool forTeam) payable
    beforeTimestamp(timestampMatchBegin) {
    require(!arbiter.isMember(msg.sender));
    require(msg.value > 0);
    uint prevSum;
    
    if (forTeam == false) {
      // Cannot bet in two teams
      require(betsToTeam1[msg.sender] == 0);
      prevSum = team0BetSum;
      require((prevSum + msg.value) >= prevSum); // Overflow
      team0BetSum += msg.value;
      assert(team0BetSum >= prevSum);
      betsToTeam0[msg.sender] += msg.value;
    }
    else {
      // Cannot bet in two teams
      require(betsToTeam0[msg.sender] == 0);
      prevSum = team1BetSum;
      require((prevSum + msg.value) >= prevSum); // Overflow
      team1BetSum += msg.value;
      assert(team1BetSum >= prevSum);
      betsToTeam1[msg.sender] += msg.value;
    }

    NewBet(forTeam, msg.sender, msg.value);
  }

  function checkAddERC20(address erc20) internal {
    if (ERC20Team0BetSum[erc20] == 0 && ERC20Team1BetSum[erc20] == 0) {
      validERC20.push(erc20);
    }
  }

  function betERC20(address erc20, bool forTeam, uint amount)
    beforeTimestamp(timestampMatchBegin) {
    require(!arbiter.isMember(msg.sender));
    require(amount > 0);
    uint prevSum;

    ERC20 erc20Contract = ERC20(erc20);
    require(erc20Contract.transferFrom(msg.sender, this, amount));

    checkAddERC20(erc20);

    if (forTeam == false) {
      // Cannot bet in two teams
      require(ERC20BetsToTeam1[erc20][msg.sender] == 0);
      prevSum = ERC20Team0BetSum[erc20];
      require((prevSum + amount) >= prevSum); // Overflow
      ERC20Team0BetSum[erc20] += amount;
      assert(ERC20Team0BetSum[erc20] >= prevSum);
      ERC20BetsToTeam0[erc20][msg.sender] += amount;
    }
    else {
      // Cannot bet in two teams
      require(ERC20BetsToTeam0[erc20][msg.sender] == 0);
      prevSum = ERC20Team1BetSum[erc20];
      require((prevSum + amount) >= prevSum); // Overflow
      ERC20Team1BetSum[erc20] += amount;
      assert(ERC20Team1BetSum[erc20] >= prevSum);
      ERC20BetsToTeam1[erc20][msg.sender] += amount;
    }

    NewBetERC20(forTeam, msg.sender, amount, erc20);
  }

  function withdraw() 
    afterTimestamp(timestampMatchEnd)
    matchIsDecided() {
    uint idx;
    if (betState == BET_STATES.DRAW) {
      msg.sender.transfer(collectOriginalBet());
      for (idx = 0; idx < validERC20.length; ++idx) {
        uint amount = collectOriginalBetERC20(validERC20[idx]);
        if (amount > 0) {
          ERC20 erc20Contract = ERC20(validERC20[idx]);
          require(erc20Contract.transfer(msg.sender, amount));
        }
      }
    }
    else {
      collectProfit();
      for (idx = 0; idx < validERC20.length; ++idx) {
        collectProfitERC20(validERC20[idx]);
      }
    }
  }

  // Transfers the user's initial bet back
  function collectOriginalBet() internal returns(uint) {
    uint amount;
    if (betsToTeam0[msg.sender] > 0) {
      amount = betsToTeam0[msg.sender];
      betsToTeam0[msg.sender] = 0;
      return amount;
    }
    else if (betsToTeam1[msg.sender] > 0) {
      amount = betsToTeam1[msg.sender];
      betsToTeam1[msg.sender] = 0;
      return amount;
    }
    else {
      return 0;
    }
  }

  // Transfers the user's initial bet back
  function collectOriginalBetERC20(address erc20) internal returns(uint) {
    uint amount;
    if (ERC20BetsToTeam0[erc20][msg.sender] > 0) {
      amount = ERC20BetsToTeam0[erc20][msg.sender];
      ERC20BetsToTeam0[erc20][msg.sender] = 0;
      return amount;
    }
    else if (ERC20BetsToTeam1[erc20][msg.sender] > 0) {
      amount = ERC20BetsToTeam1[erc20][msg.sender];
      ERC20BetsToTeam1[erc20][msg.sender] = 0;
      return amount;
    }
    else {
      return 0;
    }
  }

  function collectProfit() internal {
    uint bet = 0;
    uint sum = 0;
    uint profit = 0;

    if (betState == BET_STATES.TEAM_ZERO_WON && betsToTeam0[msg.sender] > 0) {
      bet = betsToTeam0[msg.sender];
      sum = team0BetSum;
      profit = team1BetSum;
    }
    else if (betState == BET_STATES.TEAM_ONE_WON && betsToTeam1[msg.sender] > 0) {
      bet = betsToTeam1[msg.sender];
      sum = team1BetSum;
      profit = team0BetSum;
    }
    else {
      return;
    }

    assert(bet <= sum);

    profit = computeProfit(bet, sum, profit);
    msg.sender.transfer(profit + collectOriginalBet());
  }

  function collectProfitERC20(address erc20) internal {
    uint bet = 0;
    uint sum = 0;
    uint profit = 0;

    if (betState == BET_STATES.TEAM_ZERO_WON && ERC20BetsToTeam0[erc20][msg.sender] > 0) {
      bet = ERC20BetsToTeam0[erc20][msg.sender];
      sum = ERC20Team0BetSum[erc20];
      profit = ERC20Team1BetSum[erc20];
    }
    else if (betState == BET_STATES.TEAM_ONE_WON && ERC20BetsToTeam1[erc20][msg.sender] > 0) {
      bet = ERC20BetsToTeam1[erc20][msg.sender];
      sum = ERC20Team1BetSum[erc20];
      profit = ERC20Team0BetSum[erc20];
    }
    else {
      return;
    }

    assert(bet <= sum);

    profit = computeProfit(bet, sum, profit);
    ERC20 erc20Contract = ERC20(erc20);
    require(erc20Contract.transfer(msg.sender, profit + collectOriginalBetERC20(erc20)));
  }


  // Compute the user's profit
  function computeProfit(uint bet, uint sum, uint profit) internal returns(uint) {
    // Approach one:
    // We might lose precision, but no overflow
    var senderPc = bet / sum;
    assert(senderPc >= 0 && senderPc <= 1);
    
    var senderProfit = senderPc * profit;
    assert(senderProfit <= profit);
    
    // Approach two:
    // Better precision, since multiplication is done first, but may overflow
    //uint sender_profit = (bet * profit) / sum;
    
    var mulTax = (senderProfit * TAX);
    require(mulTax >= senderProfit); // Overflow
    var tax = mulTax / 100;
    assert(tax <= senderProfit);
    
    var notaxProfit = senderProfit;
    senderProfit -= tax;
    assert(senderProfit <= notaxProfit);

    return senderProfit;

    // We can collect the bet tax by ourselves when the bet self-destructs
    // owner.transfer(tax);
    //msg.sender.transfer(senderProfit + collectOriginalBet());
  }
  
  /* After the arbiter deadline and before the self-destruct
   * deadline, anyone can set the bet state to DRAW.
   * this is in the unlikely event if the arbiter don't
   * decide in time, every one can collect the funds.
  */
  function close()
    afterTimestamp(timestampArbiterDeadline)
    beforeTimestamp(timestampSelfDestructDeadline) {
    betState = BET_STATES.DRAW;
  }

  /* Selfdestructs the bet and return what it has in the account
   * as a fee to the bet's owner.
   */
  function terminate()
    afterTimestamp(timestampSelfDestructDeadline) {
    selfdestruct(owner);
  }

  /* Fallback just throws now
   * Can do something, maybe increase the value of both pools
  */
  function () { require(false); }
}
