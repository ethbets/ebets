/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

const Ebets = artifacts.require('ebets');
const Bet = artifacts.require('Bet');
const Monarchy = artifacts.require('Monarchy'); 
const BigNumber = require('bignumber.js');

const increaseTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // time in seconds 
      id: 1231231231231
    }, (err, success) => {
    if (err) reject(err);
    else resolve(success);
    });
  });
}

const getBalancePromise = (address) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

contract('ebets', accounts => {
  var arbiterInstance;
  var createdBet;
  before((done) => {
    Monarchy.new({from: accounts[0]})
    .then(instance => {
      arbiterInstance = instance;
    })
    .then(() => {
      return Ebets.new({from: accounts[0]})
    })
    .then(betInstance => {
      const now = Math.floor(Date.now() / 1000);
      const beginMatch = now + 1010;
      const endMatch = beginMatch + 50;
      const arbiterDeadline = endMatch + 50000;
      const terminateDeadline = arbiterDeadline + 50000;

      var timestamps = [beginMatch, endMatch, arbiterDeadline, terminateDeadline];

      return betInstance.createBet(arbiterInstance.address, 'A', 'B', 'LOL',
        timestamps,{gas: 4300000, from: accounts[0]});
    })
    .then(events => {
      var addr = events.logs[0].args.betAddr;
      createdBet = Bet.at(addr);
      done();
    })
  });

  it('Bet should start open', (done) => {
    createdBet.betState()
    .then(betState => {
      assert(betState.equals(new BigNumber(0)));
      done();
    });
  });

  it('Check bet teams', (done) => {
    createdBet.team0Name()
    .then(team0Name => {
      assert(team0Name === 'A');
    });
    createdBet.team1Name()
    .then(team1Name => {
      assert(team1Name === 'B');
      done();
    });
  });

  it('Arbiter should not bet!', (done) => {
    createdBet.bet(false, {from: accounts[0]})
    .then()
    .catch(err => {
      assert(true);
      done();
    });
  });

  it('Bet on team A', (done) => {
    createdBet.bet(false, {from: accounts[1], value: `0x${(1e18).toString(16)}`})
    .then(receipt => {
      assert(receipt.logs[0].event === 'NewBet');
      done();
    });
  });

  it('Cannot bet on team A and B afterwards', (done) => {
    createdBet.bet(true, {from: accounts[1], value: 1e18})
    .then()
    .catch(err => {
      assert(true);
      done();
    });
  });

  it('Bet on team B', (done) => {
     createdBet.bet(true, {from: accounts[2], value: `0x${(1e18).toString(16)}`})
    .then(receipt => {
      assert(receipt.logs[0].event === 'NewBet');
      done();
    });
  })

  it('Calls the resolver', (done) => {
    createdBet.updateResult()
    .then(receipt => {
      done();
    });
  });

  it('Only arbiter can vote', (done) => {
    // Cast so team 0 won
    arbiterInstance.castVote(createdBet.address, 1, {from: accounts[3]})
    .then(() => {
      assert(false);
    })
    .catch(() => {
      assert(true);
      done();
    });
  });

  it('Resolve the bet to team 0', (done) => {
    // Cast so team 0 won
    arbiterInstance.castVote(createdBet.address, 1)
    .then(receipt => {
      return createdBet.betState()
    })
    .then(betState => {
      assert(betState.toNumber() == 1);
      done();
    });
  });

  it('Withdraws accounts[1]', (done) => {
    // Cast so team A won
    var previousBalance;
    getBalancePromise(accounts[1])
    .then(balance => {
      previousBalance = balance;
      return createdBet.withdraw({from: accounts[1]})
    })
    .then(receipt => {
      return getBalancePromise(accounts[1]); 
    })
    .then(balance => {
      assert(previousBalance.lessThan(balance));
      done();
    })
  });

})

