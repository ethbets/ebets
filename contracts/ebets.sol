pragma solidity ^0.4.11;

import './bet.sol';
import './governanceInterface.sol';

contract Ebets {
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  address owner;
  mapping (string => Bet[]) bets; //indexed by category

  /* TODO: ALSO FIRE CATEGORY EVENT
   * TODO: INDEX category! There is an issue with web3 that prevents us to do it
   * right now: https://github.com/ethereum/web3.js/issues/434
  */
  event createdBet(address betAddr, string category);
  
  function Ebets() {
    owner = msg.sender;
  }
  
  function createBet(GovernanceInterface arbiter, string team0Name,
                      string team1Name, string category, 
                      uint[] timestamps) {

    Bet bet = new Bet(arbiter, team0Name, team1Name, timestamps);
    // Featured by default for resolver
    if (msg.sender == owner)
      bet.toggleFeatured();
    bets[category].push(bet);
    createdBet(bet, category);
  }

  function modifyCategory(uint betIdx, string oldCategory, string newCategory) 
    onlyOwner() {
    Bet bet = bets[oldCategory][betIdx];
    removeBet(oldCategory, betIdx);
    bets[newCategory].push(bet);
  }

  function toggleFeatured(uint betIdx, string category) onlyOwner() {
    bets[category][betIdx].toggleFeatured();
  }

  function getBetsByCategory(string category) constant returns(Bet[]) {
    return bets[category];
  }

  function removeBet(string category, uint index) internal {
    bets[category][index] = bets[category][bets[category].length - 1];
    delete bets[category][bets[category].length - 1];
  }
}
