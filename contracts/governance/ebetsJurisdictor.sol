pragma solidity ^0.4.11;

import './bet.sol';
import './governanceInterface.sol';

contract EbetsJurisdictor {
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  address owner;
  /* TODO: ALSO FIRE CATEGORY EVENT
   * TODO: INDEX category! There is an issue with web3 that prevents us to do it
   * right now: https://github.com/ethereum/web3.js/issues/434
  */
  event createdGovernance(address betAddr);
  
  function createGovernance(GovernanceInterface arbiter) {
  }
}
