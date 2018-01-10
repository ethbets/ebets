/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;
import './bet.sol';

contract TeamBet {
  string public name;
  uint public betSum;
  mapping (address => uint) public betsToTeam;
  Bet betContract;

  modifier beforeTimestamp(uint timestamp) {
    require(block.timestamp < timestamp);
    _;
  }

  modifier onlyBetContract() {
    require(Bet(msg.sender) == betContract);
    _;
  }

  event NewBet(address indexed from, uint amount);

  function TeamBet(string _name) public {
    name = _name;
    betContract = Bet(msg.sender);
  }

  function () public payable
    beforeTimestamp(betContract.timestampMatchBegin()) {
    //require(!betContract.arbiter.isMember(msg.sender));
    require(msg.value > 0);

    uint prevSum;
    require(betsToTeam[msg.sender] == 0);
    prevSum = betSum;
    require((prevSum + msg.value) >= prevSum); // Overflow
    betSum += msg.value;
    assert(betSum >= prevSum);
    betsToTeam[msg.sender] += msg.value;

    NewBet(msg.sender, msg.value);
  }

  /* Called when this is the winner team
   * Before: Winner's stake in the contract
   * After: Winner's stake transfered to winner address
  */
  function getOriginalBet(address winner) public
    onlyBetContract() returns(uint profit){
    uint betAmount = betsToTeam[winner];
    betsToTeam[winner] = 0;
    winner.transfer(betAmount);
    return betAmount;
  }

  /* Called when this is the loser team
   * Before: winner not paid
   * After: Due funds transfered to winner address
  */
  function collectProfit(address winner, uint otherBetAmount, uint otherBetSum, uint arbiterTax)
    public
    onlyBetContract() returns (uint winnerProfit) {
    // Approach one:
    // We might lose precision, but no overflow
    var senderPc = otherBetAmount / otherBetSum;
    assert(senderPc >= 0 && senderPc <= 1);
    
    var senderProfit = senderPc * betSum;
    assert(senderProfit <= betSum);
    
    // Approach two:
    // Better precision, since multiplication is done first, but may overflow
    //uint sender_profit = (bet * profit) / sum;
    
    var mulTax = (senderProfit * arbiterTax);
    require(mulTax >= senderProfit); // Overflow
    var tax = mulTax / 100;
    assert(tax <= senderProfit);
    
    var notaxProfit = senderProfit;
    senderProfit -= tax;
    assert(senderProfit <= notaxProfit);
    winner.transfer(senderProfit);
    return senderProfit;
  }

  // To be called by the bet and given to arbiter
  // Call only at the very end of the bet
  function collectBet() public onlyBetContract() returns(uint collected) {
    selfdestruct(betContract);
  }
}