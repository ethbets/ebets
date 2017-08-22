Branch erc20 TODO list:

Layout:
- [ ] When there are many bets in the list, the pool numbers look somewhat confusing (the blue chips).
      Suggestions:
      1) Use a fixed size for the blue chips and teams names
      2) Use a slightly different background color for odd/even bets in the list
- [ ] Improve withdraw list layout

Logic:
- [X] Withdraw: Send list of tokens to withdraw, like this the user can pay the price
  of doing only the necessary bet withdraws.
- [ ] Use ERC20 decimals. For now default is 18
- [ ] If the user bet on the loser team but no one bet on the winner, user gets their money back

Front
- [X] Withdraw: compute withdraw value according to the selected currency
- [X] Activate "loading bar" already when Approval request is sent
- [ ] Dialog asking for confirmation before Approve
- [ ] Dialog asking for confirmation before Bet (after Approve)
- [X] Dialog listing all the tokens that the user will Withdraw when pressed
      "Withdraw" button

Bugs
- [ ] When creating a bet: Uncaught (in promise) Error: Invalid number of arguments to Solidity function
- [X] Category icon not showing
- [ ] When Approval doesn't work, the promise resolves anyway and the current JS code thinks it's time to send the real Bet transaction. This should be fixed.
- [ ] When the page is loaded without an account, the user is able to choose the team in a bet that they've already bet when they log into their metamask account
      (reload page when account changes)
