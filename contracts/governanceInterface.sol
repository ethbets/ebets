/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;

contract ProposalInterface {
  // Callback to resolve Proposal
  function __resolve(uint outcome);
}

contract GovernanceInterface {

  // Members can be added/removed to the governance
  event AddedMember(address newMember);
  event RemovedMember(address removedMember);
  // Contract referenced in the Proposal quorum*100 needed in percentage
  event AddedProposal(address reference, uint deadline, uint quorum);
  // Proposal is resolved, should Proposal __resolved(outcome) on address
  event ResolvedProposal(address reference, uint outcome);

  function isMember(address user) constant returns(bool member);
  function getName() constant returns(string name);
  function getHigherInstance() constant returns(address instanceAddress);
  
  function addMember(address member);
  function removeMember(address member);
  // Member cast vote for Proposal if enough are made can call ResolvedCall
  function castVote(address proposal, uint outcome);
  // Proposal should be solved by the deadline time
  function addProposal(address contractToDecide, uint deadline);
}
