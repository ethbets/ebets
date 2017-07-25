pragma solidity ^0.4.11;

import './governanceInterface.sol';
import './helpers.sol';

contract Bet is GovernanceInterface {
  enum BET_STATES {
    OPEN,
    TEAM_ZERO_WON,
    TEAM_ONE_WON,
    DRAW,
    UNDECIDED
    }
  
  BET_STATES public bet_state = BET_STATES.OPEN;
  address public owner; //Can be a parent contract
  address public resolver; //Usually an account
  bool public is_featured;
  string public team_0_title;
  string public team_1_title;
  string public description;
  string public category;
  string public team_0_id; // Team 0 identifier
  string public team_1_id; // Team 1 identifier
  uint public team_0_bet_sum;
  uint public team_1_bet_sum;
  mapping (address => uint) public bets_to_team_0;
  mapping (address => uint) public bets_to_team_1;

  uint public timestamp_match_begin;
  uint public timestamp_match_end;
  uint public timestamp_hard_deadline; // Hard deadline to end bet (for the oracle)
  uint public timestamp_terminate_deadline; // Self-destruct deadline > hard_deadline (this must be big, so people can withdraw their funds)

  uint8 constant TAX = 10;
  uint constant TIMESTAMP_MARGIN = 1000;

  event new_bet(bool for_team, address from, uint amount);
  event state_changed(BET_STATES state);

  function Bet(address _resolver, string _team_0_title, 
               string _team_1_title, string _category, 
               string _team_0_id, string _team_1_id, uint[] _timestamps
               ) {
    require(block.timestamp < _timestamps[0]);
    require(_timestamps[0] < _timestamps[1]);
    require(_timestamps[1] < _timestamps[2]);
    require(_timestamps[2] < _timestamps[3]);

    is_featured = false;
    owner = msg.sender;
    resolver = _resolver;
    team_0_title = _team_0_title;
    team_1_title = _team_1_title;
    category = _category;
    team_0_id = _team_0_id;
    team_1_id = _team_1_id;
    timestamp_match_begin = _timestamps[0] - TIMESTAMP_MARGIN;
    timestamp_match_end = _timestamps[1] + TIMESTAMP_MARGIN;
    timestamp_hard_deadline = _timestamps[2] + TIMESTAMP_MARGIN;
    timestamp_terminate_deadline = _timestamps[3] + TIMESTAMP_MARGIN;
  }

  function arbitrate(BET_STATES result) {
    require(block.timestamp >= timestamp_hard_deadline);
    require(bet_state == BET_STATES.UNDECIDED);
    require(result != BET_STATES.UNDECIDED);
    require(result != BET_STATES.OPEN);
    
    bet_state = result;
    state_changed(result);
  }

  function __callback(bytes32 myid, string result) {
    // Cannot call after hard deadline
    require(block.timestamp < timestamp_hard_deadline);
    // Oraclize should call this
    // require(msg.sender == oraclize_cbAddress());
    // Must be called after the bet ends
    require(block.timestamp >= timestamp_match_end);

    if (Helpers.string_equal(result, team_0_id))
      bet_state = BET_STATES.TEAM_ZERO_WON;
    else if (Helpers.string_equal(result, team_1_id))
      bet_state = BET_STATES.TEAM_ONE_WON;
    else
      bet_state = BET_STATES.UNDECIDED;

    state_changed(bet_state);
  }

  function update_result() payable {
    // Can call only when bet is open or undecided
    require(bet_state == BET_STATES.OPEN || bet_state == BET_STATES.UNDECIDED);
    require(block.timestamp >= timestamp_match_end);

    // oraclize_query('URL', url_oraclize);
  }
  
  function toggle_featured() {
    require(msg.sender == resolver || msg.sender == owner);
    is_featured = !is_featured;
  }

  function modify_category(string new_category) {
    require(msg.sender == resolver || msg.sender == owner);
    category = new_category;
  }
  
  // 
  function bet(bool for_team) payable {
    require(block.timestamp < timestamp_match_begin);
    uint prev_sum;
    
    if (for_team == false) {
      // Cannot bet in two teams
      require(bets_to_team_1[msg.sender] == 0);
      prev_sum = team_0_bet_sum;
      require((prev_sum + msg.value) >= prev_sum); // Overflow
      team_0_bet_sum += msg.value;
      assert(team_0_bet_sum >= prev_sum);
      bets_to_team_0[msg.sender] += msg.value;
    }
    else {
      // Cannot bet in two teams
      require(bets_to_team_0[msg.sender] == 0);
      prev_sum = team_1_bet_sum;
      require((prev_sum + msg.value) >= prev_sum); // Overflow
      team_1_bet_sum += msg.value;
      assert(team_1_bet_sum >= prev_sum);
      bets_to_team_1[msg.sender] += msg.value;
    }

    new_bet(for_team, msg.sender, msg.value);
  }

  // The commented code works allows money withdraw before the match begins.
  // It was decided that this will not be allowed.
  function withdraw() {
    //require(block.timestamp < timestamp_match_begin || bet_state == BET_STATES.TEAM_ZERO_WON || bet_state == BET_STATES.TEAM_ONE_WON || bet_state == BET_STATES.DRAW);
    require(block.timestamp > timestamp_match_end && (bet_state == BET_STATES.TEAM_ZERO_WON || bet_state == BET_STATES.TEAM_ONE_WON || bet_state == BET_STATES.DRAW));
    //if (block.timestamp < timestamp_match_begin || bet_state == BET_STATES.DRAW) {
    if (bet_state == BET_STATES.DRAW) {
        collect_bet();
    }
    else {
        collect_profit();
    }
  }

  // Transfers the user's initial bet back
  function collect_bet() internal {
    require(bets_to_team_0[msg.sender] > 0 || bets_to_team_1[msg.sender] > 0);

    uint amount;
    if (bets_to_team_0[msg.sender] > 0) {
      amount = bets_to_team_0[msg.sender];
      bets_to_team_0[msg.sender] = 0;
      msg.sender.transfer(amount);
    }
    else { // if (bets_to_team_1[msg.sender] > 0)
      amount = bets_to_team_1[msg.sender];
      bets_to_team_1[msg.sender] = 0;
      msg.sender.transfer(amount);
    }
  }

  // Transfers the user's profit
  function collect_profit() internal {
    require( ( bet_state == BET_STATES.TEAM_ZERO_WON && bets_to_team_0[msg.sender] > 0 ) || 
             ( bet_state == BET_STATES.TEAM_ONE_WON && bets_to_team_1[msg.sender] > 0 ) );

    uint bet = 0;
    uint sum = 0;
    uint profit = 0;

    if (bet_state == BET_STATES.TEAM_ZERO_WON && bets_to_team_0[msg.sender] > 0) {
      bet = bets_to_team_0[msg.sender];
      sum = team_0_bet_sum;
      profit = team_1_bet_sum;
    }
    else { // if (BET_STATES.bet_state == TEAM_ONE_WON && bets_to_team_1[msg.sender] > 0)
      bet = bets_to_team_1[msg.sender];
      sum = team_1_bet_sum;
      profit = team_0_bet_sum;
    }

    assert(bet <= sum);

    // Approach one:
    // We might lose precision, but no overflow
    var sender_pc = bet / sum;
    assert(sender_pc >= 0 && sender_pc <= 1);
    
    var sender_profit = sender_pc * profit;
    assert(sender_profit <= profit);
    
    // Approach two:
    // Better precision, since multiplication is done first, but may overflow
    //uint sender_profit = (bet * profit) / sum;

    var mul_tax = (sender_profit * TAX);
    require(mul_tax >= sender_profit); // Overflow
    var tax = mul_tax / 100;
    assert(tax <= sender_profit);

    var notax_profit = sender_profit;
    sender_profit -= tax;
    assert(sender_profit <= notax_profit);

    resolver.transfer(tax);
    collect_bet();
    msg.sender.transfer(sender_profit);
  }
  
  function close() {
    require(block.timestamp > timestamp_terminate_deadline);
    selfdestruct(resolver);
  }

  /* Fallback just throws now
   * Can do something, maybe increase the value of both pools
  */
  function () { throw; }
}
