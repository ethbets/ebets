pragma solidity ^0.4.11;
library betlib {
  function computeProfit(uint betAmount, uint sum, uint profit, uint8 arbiter_tax) internal returns(uint) {
    // Approach one:
    // We might lose precision, but no overflow
    var senderPc = betAmount / sum;
    assert(senderPc >= 0 && senderPc <= 1);
    
    var senderProfit = senderPc * profit;
    assert(senderProfit <= profit);
    
    // Approach two:
    // Better precision, since multiplication is done first, but may overflow
    //uint sender_profit = (bet * profit) / sum;
    
    var mulTax = (senderProfit * arbiter_tax);
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
}