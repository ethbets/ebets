/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;
import './governanceInterface.sol';

contract Governance is GovernanceInterface{
  struct Proposal {
    uint quorumNeeded;
    uint deadline;
    address[] voted;
    uint[] outcomes;
  }
  // Members of the Governance have a weight in their vote
  mapping (address => uint) public members;
  // Used in case of indecision
  address public higherInstance;
  mapping (address => Proposal) public proposals;

  // Members can be added to the governance
  event AddedMember(address newMember);
  // Contract referenced in the Proposal quorum*100 needed in percentage
  event AddedProposal(address reference, uint deadline, uint quorum);
  // Proposal is resolved, should Proposal __resolved(outcome) on address
  event ResolvedProposal(address reference, uint outcome);

  function addMember(address member);
  function removeMember(address member);
  // Member cast vote for Proposal if enough are made can call ResolvedCall
  function castVote(address proposal, uint outcome);
  // Proposal should be solved by the deadline time
  function addProposal(address proposalAddress, uint deadline);
}