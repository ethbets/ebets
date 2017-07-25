pragma solidity ^0.4.11;
import './governance.sol';

contract Monarchy is Governance {
  event AddedProposal(address reference, uint quorum);
  // 0 - Undecided, 1 - Team 0 won, 2 - Team 1 won, 3 - Draw
  event ResolvedProposal(address reference, uint outcome);

  modifier isActiveMember() {
    require(members[msg.sender] >= 1);
    _;
  }

  function Monarchy() {
    members[msg.sender] = 1;
  }

  function castVote(address proposal, uint outcome) isActiveMember {
    GovernanceInterface proposalContract = GovernanceInterface(proposal);
    proposalContract.__resolve(outcome);
    ResolvedProposal(proposal, outcome);
  }
  function addProposal(address proposalAddress, uint deadline) {
    require(block.timestamp < deadline);
    // Allow one proposal per bet
    require(proposals[proposalAddress].deadline == 0);
    proposals[proposalAddress].deadline = deadline;
  }
}