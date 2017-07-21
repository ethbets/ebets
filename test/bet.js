var Ebets = artifacts.require('ebets');
var Bet = artifacts.require('Bet');
var BigNumber = require('bignumber.js');

contract('ebets', accounts => {
  var newBet;
  it('Should make a bet', () => {
    return Ebets.new({from: accounts[0]})
    .then(instance => {
      var now = Math.floor(Date.now() / 1000);
      var array = [now + 100000, now + 200000, now + 300000, now + 400000];

      return instance.create_bet('A', 'B', 'LOL', 'AID', 'BID',
        array, 'asdasdas', {gas: 4300000, from: accounts[0]});
    })
    .then(events => {
      console.log(events);
      var addr = events.logs[0].args.bet_addr;
      var new_bet = Bet.at(addr);
      newBet = new_bet;
      return new_bet;
    })
    .then(toggled => {
      return newBet.is_featured();
    })
    .then(featured_bet => {
      console.log(featured_bet);
    });
  });
});

