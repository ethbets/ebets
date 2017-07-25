pragma solidity ^0.4.11;

import './bet.sol';
import './governanceInterface.sol';

contract Ebets {
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  address owner;
  event createdBet(address bet_addr);
  
  function Ebets() {
    owner = msg.sender;
  }
  
  function createBet(GovernanceInterface arbiter, string team0Name,
                      string team1Name, string category, 
                      uint[] timestamps) {

    Bet bet = new Bet(arbiter, team0Name, team1Name, category, timestamps);
    // Featured by default for resolver
    if (msg.sender == owner)
      bet.toggleFeatured();
    createdBet(bet);
  }
  function modifyCategory(Bet bet, string newCategory) onlyOwner(){
    bet.modifyCategory(newCategory);
  }
  function toggleFeatured(Bet bet) onlyOwner(){
    bet.toggleFeatured();
  }
}
