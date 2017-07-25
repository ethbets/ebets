pragma solidity ^0.4.11;
import './governance.sol';

contract Triunvirate is Governance {
  event AddedMember(address newMember);
  event AddedCall(address reference, uint quorum);
  event ResolvedCall(address reference, uint outcome);

  function Triunvirate(address[] _members) {
    for (uint i = 0; i < _members.length; ++i)
      members[_members[i]] = 1;
  }

  function castVote(address call, uint outcome) {
    require(members[msg.sender] >= 1);
    if (calls[call].voted.length == 0) {
      calls[call].voted.push(msg.sender);
      calls[call].outcomes.push(outcome);
      return;
    }
    require(calls[call].voted[0] != msg.sender);
    // 0 voted x, 1 voted x
    if (calls[call].outcomes[0] == outcome) {
      calls[call].voted.push(msg.sender);
      calls[call].outcomes.push(outcome);
      ResolvedCall(address, outcome);
      call.__resolve(outcome);
      return;
    }
    require(calls[call].voted[0] != msg.sender &&
            calls[call].voted[1] != msg.sender);
    calls[call.voted.push].push(msg.sender);
    calls[call].outcomes.push(outcome);
    // 0 voted x, 1 voted y 2 voted x
    if (outcome == calls[call].outcomes[0] || outcome == calls[call].outcomes[1])
      ResolvedCall(address, outcome);
    else
      ResolvedCall(address, -1);
  }
  function addCall(address callAddress, uint deadline) {
    require(block.timestamp < deadline);
    calls[callAddress].quorumNeeded = 2;
    calls[callAddress].deadline = deadline;
  }
}