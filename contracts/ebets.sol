pragma solidity ^0.4.11;

import './bet.sol';

contract ebets {
  address resolver;
  event created_bet(address bet_addr);
  
  function ebets() {
    resolver = msg.sender;
  }
  
  function create_bet(string team_0_title, string team_1_title, string category, 
                      string team_0_id, string team_1_id, uint[] timestamps,
                      string url_oraclize) {

    Bet bet = new Bet(resolver, team_0_title, team_1_title, category,
                          team_0_id, team_1_id, timestamps,
                          url_oraclize);
    // Featured by default for resolver
    if (msg.sender == resolver)
      bet.toggle_featured();

    created_bet(bet);
  }
}
