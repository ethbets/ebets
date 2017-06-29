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
  bool public is_featured;
  string public title;
  string public description;
  string public category;
  string public team_0; // Team 0 identifier
  string public team_1; // Team 1 identifier
  uint public team_0_bet_sum;
  uint public team_1_bet_sum;
  mapping (address => uint) public bets_by_address;
  
  uint public block_match_begin;
  uint public block_match_end;
  uint public block_hard_deadline; // Hard deadline to end bet
  uint public block_suicide_deadline; // Suicide deadline > hard_deadline (this must be big, so people can withdraw their funds)

  uint8 oracle_retries; // How many times the oracle tried to set the score on the bet
  uint constant oracle_retry_interval = 100; // Interval for retries (in blocks)

  string url_oraclize;

  event new_betting(bool for_team, address from, uint amount);
  event new_winner_declared(BET_STATES winner);

  function arbitrate(bool winner) {
    assert(block.number >= block_hard_deadline);
    assert(bet_state == BET_STATES.ORACLE_UNDECIDED);

    if (winner == false)
       bet_state = BET_STATES.TEAM_ONE_WON;
    else
       bet_state = BET_STATES.TEAM_TWO_WON;
  }

  function __callback(bytes32 myid, string result) {
    // Cannot call after hard deadline
    assert(block.number < block_hard_deadline);
    // Oraclize should call this
    assert(msg.sender == oraclize_cbAddress());
    // Must be called after the bet ends
    assert(block.number >= block_match_end);
    // Can call only when bet is open or undecided
    assert(bet_state == BET_STATES.OPEN || bet_state == BET_STATES.ORACLE_UNDECIDED);

    oracle_retries += 1;
    // Oracle is retrying 
    if (bet_state == BET_STATES.ORACLE_UNDECIDED) {
      assert(block.number >= (block_match_end + (oracle_retry_interval * oracle_retries)));
    }
    if (Helpers.string_equal(result, team_0))
      bet_state = BET_STATES.TEAM_ONE_WON;
    else if (Helpers.string_equal(result, team_1))
      bet_state = BET_STATES.TEAM_TWO_WON;
    else
      bet_state = BET_STATES.ORACLE_UNDECIDED;

    new_winner_declared(bet_state);
  }

  function update_result() payable {
    oraclize_query('URL', url_oraclize);
  }
  
  function toggle_featured() {
    //if (msg.sender != ebets_address()) throw;
    is_featured = !is_featured;
  }
  
  // 
  function bet(bool for_team) {
    assert(block.number < block_match_begin);
    if (for_team == false)
      team_0_bet_sum += msg.value;
    else
      team_1_bet_sum += msg.value;
    
    //TODO: change to say in which team the person voted
    //TODO: Allow change voting and withdraw before bet closes
    bets_by_address[msg.sender] += msg.value;

    new_betting(for_team, msg.sender, msg.value);
  }

  // Called by the user to collect his reward
  function collect_profit() {

  }
  
  // If the oracle fails or is not able to get the right answer
  function resolve_conflict(uint8 for_team_idx) {
  }
}
