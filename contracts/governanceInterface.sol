pragma solidity ^0.4.11;

interface GovernanceInterface {

  // Members can be added to the governance
  event AddedMember(address newMember);
  // Contract referenced in the Proposal quorum*100 needed in percentage
  event AddedProposal(address reference, uint quorum);
  // Proposal is resolved, should Proposal __resolved(outcome) on address
  event ResolvedProposal(address reference, uint outcome);

  function addMember(address member);
  function removeMember(address member);
  // Member cast vote for Proposal if enough are made can call ResolvedCall
  function castVote(address proposal, uint outcome);
  // Proposal should be solved by the deadline time
  function addProposal(uint deadline);

  // Callback to resolve Proposal
  function __resolve(uint outcome);
}