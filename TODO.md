Branch erc20 TODO list:

Front
- When the Bet contract is instantiated, read the "validERC20" list from the contract,
  and build a dict with the amount the user has bet for each currency used so far
- Withdraw: compute withdraw value according to the selected currency
  Maybe: not show any value at all
- Withdraw: Send list of tokens to withdraw, like this the user can pay the price
  of doing only the necessary bet withdraws.

Bugs
- When creating a bet: Uncaught (in promise) Error: Invalid number of arguments to Solidity function
- Category icon not showing
- When Approval doesn't work, the promise resolves anyway and the current JS code thinks it's time to send the real Bet transaction. This should be fixed.
