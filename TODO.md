Branch erc20 TODO list:

Logic:
- Figure what exactly to do with Token decimals

Front
- Withdraw: compute withdraw value according to the selected currency
  Maybe: not show any value at all
- Withdraw: Send list of tokens to withdraw, like this the user can pay the price
  of doing only the necessary bet withdraws.
- Use "loading bar" already when Approval request is sent

Bugs
- When creating a bet: Uncaught (in promise) Error: Invalid number of arguments to Solidity function
- Category icon not showing
- When Approval doesn't work, the promise resolves anyway and the current JS code thinks it's time to send the real Bet transaction. This should be fixed.
