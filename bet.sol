pragma solidity ^0.4.11;

import './ethereum-api/oraclizeAPI.sol';
import './helpers.sol';

contract Bet is usingOraclize {
  enum BET_STATES {
    OPEN,
    TEAM_ONE_WON,
    TEAM_TWO_WON,
    DRAW,
    ORACLE_UNDECIDED
    }
  
  BET_STATES bet_state = BET_STATES.OPEN;
  address public resolver;
  bool public is_featured;
  string public title;
  string public description;
  string public category;
  string public team_0; // Team 0 identifier
  string public team_1; // Team 1 identifier
  uint public team_0_bet_sum;
  uint public team_1_bet_sum;
  mapping (address => uint) public bets_to_team_0;
  mapping (address => uint) public bets_to_team_1;

  uint public block_match_begin;
  uint public block_match_end;
  uint public block_hard_deadline; // Hard deadline to end bet
  uint public block_terminate_deadline; // Self-destruct deadline > hard_deadline (this must be big, so people can withdraw their funds)

  string url_oraclize;

  event new_betting(bool for_team, address from, uint amount);
  event new_winner_declared(BET_STATES winner);

  function Bet(address _resolver, string _title, string _category, 
               string _team_0, string _team_1, uint _block_match_begin,
               uint _block_match_end, uint _block_hard_deadline,
               uint _block_terminate_deadline, string _url_oraclize) {
    resolver = _resolver;
    title = _title;
    category = _category;
    team_0 = _team_0;
    team_1 = _team_1;
    block_match_begin = _block_match_begin;
    block_match_end = _block_match_end;
    block_terminate_deadline = _block_terminate_deadline;
    url_oraclize = _url_oraclize;
  }

  function arbitrate(BET_STATES result) {
    require(block.number >= block_hard_deadline);
    require(bet_state == BET_STATES.ORACLE_UNDECIDED);
    require(result != BET_STATES.ORACLE_UNDECIDED);
    require(result != BET_STATES.OPEN);
    
    bet_state = result;
    new_winner_declared(result);
  }

  function __callback(bytes32 myid, string result) {
    // Cannot call after hard deadline
    require(block.number < block_hard_deadline);
    // Oraclize should call this
    require(msg.sender == oraclize_cbAddress());
    // Must be called after the bet ends
    require(block.number >= block_match_end);

    if (Helpers.string_equal(result, team_0))
      bet_state = BET_STATES.TEAM_ONE_WON;
    else if (Helpers.string_equal(result, team_1))
      bet_state = BET_STATES.TEAM_TWO_WON;
    else
      bet_state = BET_STATES.ORACLE_UNDECIDED;

    new_winner_declared(bet_state);
  }

  function update_result() payable {
    // Can call only when bet is open or undecided
    require(bet_state == BET_STATES.OPEN || bet_state == BET_STATES.ORACLE_UNDECIDED);
    require(block.number >= block_match_end);

    oraclize_query('URL', url_oraclize);
  }
  
  function toggle_featured() {
    require(msg.sender == resolver);
    is_featured = !is_featured;
  }
  
  // 
  function bet(bool for_team) payable {
    require(block.number < block_match_begin);
    if (for_team)
    
    if (for_team) {
      // Cannot bet in two teams
      require(bets_to_team_1[msg.sender] == 0);
      team_0_bet_sum += msg.value;
      bets_to_team_0[msg.sender] += msg.value;
    }
    else {
      // Cannot bet in two teams
      require(bets_to_team_0[msg.sender] == 0);
      team_1_bet_sum += msg.value;
      bets_to_team_1[msg.sender] += msg.value;
    }

    new_betting(for_team, msg.sender, msg.value);
  }

  // Called by the user to collect his reward
  function collect_profit() {

  }
  
  // If the oracle fails or is not able to get the right answer
  function resolve_conflict(uint8 for_team_idx) {
    require(msg.sender == resolver);

  }
}
