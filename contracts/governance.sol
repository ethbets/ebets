pragma solidity ^0.4.11;

contract Governance {
  struct Call {
    uint quorumNeeded;
    uint deadline;
    address[] voted;
    uint[] outcomes;
  }
  // Members of the Governance have a weight in their vote
  mapping (address => uint) public members;
  // Used in case of indecision
  address public higherInstance;
  mapping (address => Call) calls;

  // Members can be added to the governance
  event AddedMember(address newMember);
  // Contract referenced in the Call quorum*100 needed in percentage
  event AddedCall(address reference, uint quorum);
  // Call is resolved, should call __resolved(outcome) on address
  event ResolvedCall(address reference, uint outcome);

  function addMember(address member);
  function removeMember(address member);
  // Member cast vote for call if enough are made can call ResolvedCall
  function castVote(address call, uint outcome);
  // Call should be solved by the deadline time
  function addCall(uint deadline);
}