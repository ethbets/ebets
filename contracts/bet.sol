pragma solidity ^0.4.11;

import './governanceInterface.sol';

contract Bet is ProposalInterface{

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
  modifier betInSomeTeam() {
    require(betsToTeam0[msg.sender] > 0 || betsToTeam1[msg.sender] > 0);
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
  
  BET_STATES public betState = BET_STATES.OPEN;
  address public owner; // Can be a parent contract
  GovernanceInterface public arbiter; // Governance account
  bool public isFeatured;
  string public team0Name;
  string public team1Name;
  string public category;
  uint public team0BetSum;
  uint public team1BetSum;
  mapping (address => uint) public betsToTeam0;
  mapping (address => uint) public betsToTeam1;

  uint public timestampMatchBegin;
  uint public timestampMatchEnd;
  uint public timestampArbiterDeadline;
  // Self-destruct is possible if time > timestampSelfDestructDeadline
  uint public timestampSelfDestructDeadline;

  uint8 public constant TAX = 10;
  uint constant TIMESTAMP_MARGIN = 1000;

  event NewBet(bool forTeam, address indexed from, uint amount);
  event StateChanged(BET_STATES state);

  function Bet(GovernanceInterface _arbiter, string _team0Name, 
               string _team1Name, string _category, 
               uint[] _timestamps
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
    category = _category;
    timestampMatchBegin = _timestamps[0] - TIMESTAMP_MARGIN;
    timestampMatchEnd = _timestamps[1] + TIMESTAMP_MARGIN;
    timestampArbiterDeadline = _timestamps[2] + TIMESTAMP_MARGIN;
    timestampSelfDestructDeadline = _timestamps[3] + TIMESTAMP_MARGIN;
  }

  function __resolve(uint outcome)
    onlyArbiter()
    afterTimestamp(timestampMatchEnd)
    beforeTimestamp(timestampArbiterDeadline)
    matchIsOpenOrUndecided() {
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

  function modifyCategory(string newCategory) onlyOwner() {
    category = newCategory;
  }
  
  // 
  function bet(bool forTeam) payable 
    beforeTimestamp(timestampMatchBegin) {
    require(!arbiter.isMember(msg.sender));
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

  // The commented code allows money withdraw before the match begins.
  // It was decided that this will not be allowed.
  function withdraw() 
    afterTimestamp(timestampMatchEnd)
    matchIsDecided()
    {
    if (betState == BET_STATES.DRAW) {
      collectBet();
    }
    else {
      collectProfit();
    }
  }

  // Transfers the user's initial bet back
  function collectBet() internal betInSomeTeam() {
    uint amount;
    if (betsToTeam0[msg.sender] > 0) {
      amount = betsToTeam0[msg.sender];
      betsToTeam0[msg.sender] = 0;
      msg.sender.transfer(amount);
    }
    else { // if (betsToTeam1[msg.sender] > 0)
      amount = betsToTeam1[msg.sender];
      betsToTeam1[msg.sender] = 0;
      msg.sender.transfer(amount);
    }
  }

  // Transfers the user's profit
  function collectProfit() internal {
    require( ( betState == BET_STATES.TEAM_ZERO_WON && betsToTeam0[msg.sender] > 0 ) || 
             ( betState == BET_STATES.TEAM_ONE_WON && betsToTeam1[msg.sender] > 0 ) );

    uint bet = 0;
    uint sum = 0;
    uint profit = 0;

    if (betState == BET_STATES.TEAM_ZERO_WON && betsToTeam0[msg.sender] > 0) {
      bet = betsToTeam0[msg.sender];
      sum = team0BetSum;
      profit = team1BetSum;
    }
    else { // if (BET_STATES.bet_state == TEAM_ONE_WON && betsToTeam1[msg.sender] > 0)
      bet = betsToTeam1[msg.sender];
      sum = team1BetSum;
      profit = team0BetSum;
    }

    assert(bet <= sum);

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

    owner.transfer(tax);
    collectBet();
    msg.sender.transfer(senderProfit);
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
