pragma solidity ^0.4.11;

import './bet.sol';

contract ebets {
  address resolver;

  event created_bet(address bet_addr);
  function ebets() {
    resolver = msg.sender;
  }
  
  function create_bet(string title, string category, 
                      string team_0, string team_1, uint timestamp_match_begin,
                      uint timestamp_match_end, uint timestamp_hard_deadline,
                      uint timestamp_terminate_deadline, string url_oraclize) {

    address bet = new Bet(resolver, title, category, team_0, team_1, 
                              timestamp_match_begin, timestamp_match_end,
                              timestamp_hard_deadline, timestamp_terminate_deadline,
                              url_oraclize);
    created_bet(bet);
  }
}
