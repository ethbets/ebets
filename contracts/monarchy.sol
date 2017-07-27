pragma solidity ^0.4.11;
import './governance.sol';

contract Monarchy is Governance {
  string public name = "Monarchy";
  address successor;
  modifier onlyMonarch() {
    require(members[msg.sender] >= 1);
    _;
  }

  function Monarchy() {
    members[msg.sender] = 1;
  }
  function isMember(address user) constant returns(bool isMember) {
    return (members[msg.sender] == 1);
  }
  function getName() constant returns(string name) {
    return name;
  }

  function castVote(address proposal, uint outcome) onlyMonarch() {
    ProposalInterface proposalContract = ProposalInterface(proposal);
    proposalContract.__resolve(outcome);
    // "delete" proposal
    proposals[proposal].deadline = 0;
    ResolvedProposal(proposal, outcome);
  }
  function addProposal(address proposalAddress, uint deadline) {
    require(block.timestamp < deadline);
    // Allow one proposal per bet
    require(proposals[proposalAddress].deadline == 0);
    proposals[proposalAddress].deadline = deadline;
    AddedProposal(proposalAddress, deadline, 0);
  }
  
  function addMember(address member) onlyMonarch() { 
    successor = member; 
  }
  
  function removeMember(address member) onlyMonarch() {
    members[msg.sender] = 0;
    members[successor] = 1;
    }
}
