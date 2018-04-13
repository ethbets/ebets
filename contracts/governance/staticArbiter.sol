/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

pragma solidity ^0.4.11;
import './governance.sol';

contract StaticArbiter is Governance {
  string public constant name = "Custom";
  uint nMembers;

  modifier isActiveMember() {
    require(members[msg.sender] >= 1);
    _;
  }

  modifier beforeDeadline(uint deadline) {
    require(block.timestamp < deadline);
    _;
  }

  function StaticArbiter(address[] _members) {
    nMembers = _members.length;
    for (uint i = 0; i < _members.length; ++i)
      members[_members[i]] = 1;
  }

  function isMember(address user) constant returns(bool member) {
    return (members[user] == 1);
  }
  function getName() constant returns(string) {
    return name;
  }
  function getHigherInstance() constant returns(address instanceAddress) {
    return higherInstance;
  }

  function castVote(address proposal, uint outcome) 
    isActiveMember
    beforeDeadline(proposals[proposal].deadline) {

    require(proposals[proposal].voted[msg.sender] == 0); // Did not voted before
    require(outcome != 0); // Cannot erase vote
    
    proposals[proposal].outcomes[outcome] += 1;
    uint votesInOutcome = proposals[proposal].outcomes[outcome];
    if (votesInOutcome >= proposals[proposal].quorumNeeded) {
      ProposalInterface proposalContract = ProposalInterface(proposal);
      proposalContract.__resolve(outcome);
      ResolvedProposal(proposal, outcome);
    }
    proposals[proposal].voted[msg.sender] = outcome;
  }

  function declareHanged(address proposal, uint[] arbiterVotes) {
    require(proposals[proposal].quorumNeeded > 0); // Open proposal
    uint accountedVotes = 0;
    uint winningProposalVotes = 0;
    for (uint idx = 0; idx < arbiterVotes.length; ++idx) {
      uint votesForIdx = proposals[proposal].outcomes[arbiterVotes[idx]];
      if (votesForIdx > winningProposalVotes)
        winningProposalVotes = votesForIdx;
      accountedVotes += votesForIdx;
    }
    assert(accountedVotes <= nMembers);
    // Is hanged (resolve to draw) TODO: Call higher instance
    if ((proposals[proposal].quorumNeeded - winningProposalVotes) > nMembers - accountedVotes) {
      ProposalInterface proposalContract = ProposalInterface(proposal);
      proposalContract.__resolve(3);
      ResolvedProposal(proposal, 3);
    }
  }

  function addProposal(address proposalAddress, uint deadline) 
    beforeDeadline(deadline) {

    // Allow one proposal per bet
    require(proposals[proposalAddress].deadline == 0);
    proposals[proposalAddress].deadline = deadline;
    // Require simple majority
    proposals[proposalAddress].quorumNeeded = nMembers/2 + 1;
  }
  
  // Static arbiter
  function addMember(address /*member*/) {}
  function removeMember(address /*member*/) {}
}