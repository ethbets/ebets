/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
 */

import {assertJump, BigNumber, getEvents, increaseTimeTo, waitNDays} from './utils.js';

const Ebets = artifacts.require('ebets');
const Bet = artifacts.require('Bet');
const Monarchy = artifacts.require('Monarchy');

const BET_STATES = {
  OPEN: 0,
  TEAM_ZERO_WON: 1,
  TEAM_ONE_WON: 2,
  DRAW: 3,
  UNDECIDED: 4,
  CALLED_RESOLVER: 5
};

contract('Bet', accounts => {
  const monarch = accounts[0];
  const betOwner = accounts[1];
  let arbiterInstance;
  let betInstance;
  before(async () => {
    arbiterInstance = await Monarchy.new({from: monarch});
    /*
    .then(betInstance => {
      const now = Math.floor(Date.now() / 1000);
      const beginMatch = now + 1010;
      const endMatch = beginMatch + 50;
      const arbiterDeadline = endMatch + 50000;
      const terminateDeadline = arbiterDeadline + 50000;

      var timestamps = [beginMatch, endMatch, arbiterDeadline,
    terminateDeadline];

      return betInstance.createBet(arbiterInstance.address, 'A', 'B', 'LOL',
        timestamps,{gas: 4300000, from: accounts[0]});
    })
    .then(events => {
      var addr = events.logs[0].args.betAddr;
      createdBet = Bet.at(addr);
      done();
    })
    */
  });
  it('Should have arbiter as a member', async () => {
    assert.isTrue(await arbiterInstance.isMember(monarch));
  });

  it('Should create a bet', async () => {
    const day = 60 * 24;
    const team0Name = 'Team 0';
    const team1Name = 'Team 1';

    const now = Math.floor(Date.now() / 1000);
    const timestampMatchBegin = now + day;
    const timestampMatchEnd = timestampMatchBegin + day;
    const timestampArbiterDeadline = timestampMatchEnd + day;
    const timestampAppealsDeadline = timestampArbiterDeadline + day;
    const timestampSelfDestructDeadline = timestampAppealsDeadline + day;
    const timestamps = [
      timestampMatchBegin, timestampMatchEnd, timestampArbiterDeadline,
      timestampAppealsDeadline, timestampSelfDestructDeadline
    ];
    const betTax = 1;  // 1% tax

    betInstance = await Bet.new(
        monarch, team0Name, team1Name, timestamps, betTax, {from: betOwner});

    const betState = await betInstance.betState();
    // Bet is initialized open
    assert.isTrue(betState == BET_STATES.OPEN);
    // Monarch is the arbiter
    assert.isTrue(await betInstance.arbiter() == monarch);
  });

  /*
  it('Bet should start open', (done) => {
    createdBet.betState()
    .then(betState => {
      assert(betState.equals(new BigNumber(0)));
      done();
    });
  });
  */

});
/*

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
*/
