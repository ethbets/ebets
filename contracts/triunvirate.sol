pragma solidity ^0.4.11;
import './governance.sol';

contract Triunvirate is Governance {
  event AddedMember(address newMember);
  event AddedProposal(address reference, uint quorum);
  // 0 - Undecided, 1 - Team 0 won, 2 - Team 1 won, 3 - Draw
  event ResolvedProposal(address reference, uint outcome);

  modifier isActiveMember() {
    require(members[msg.sender] >= 1);
    _;
  }

  function Triunvirate(address[] _members) {
    for (uint i = 0; i < _members.length; ++i)
      members[_members[i]] = 1;
  }

  function castVote(address proposal, uint outcome) isActiveMember {
    if (proposals[proposal].voted.length == 0) {
      proposals[proposal].voted.push(msg.sender);
      proposals[proposal].outcomes.push(outcome);
      return;
    }
    if (proposals[proposal].voted.length == 1) {
      require(proposals[proposal].voted[0] != msg.sender);
      // 0 voted x, 1 voted x
      if (proposals[proposal].outcomes[0] == outcome) {
        proposals[proposal].voted.push(msg.sender);
        proposals[proposal].outcomes.push(outcome);
        ResolvedProposal(proposal, outcome);
        //proposal.__resolve(outcome);
        return;
      }
    }
    require(proposals[proposal].voted[0] != msg.sender &&
            proposals[proposal].voted[1] != msg.sender);
    proposals[proposal].voted.push(msg.sender);
    proposals[proposal].outcomes.push(outcome);
    // 0 voted x, 1 voted y 2 voted x
    if (outcome == proposals[proposal].outcomes[0] || 
        outcome == proposals[proposal].outcomes[1])
      ResolvedProposal(proposal, outcome);
    else
      ResolvedProposal(proposal, 0);
  }
  function addProposal(address proposalAddress, uint deadline) {
    require(block.timestamp < deadline);
    proposals[proposalAddress].quorumNeeded = 2;
    proposals[proposalAddress].deadline = deadline;
  }
}