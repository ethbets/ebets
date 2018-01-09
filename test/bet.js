/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
 */

import {assertRevert, BigNumber, getEvents, increaseTimeTo, waitNDays} from './utils.js';

const should = require('chai')  // eslint-disable-line
                   .use(require('chai-as-promised'))
                   .use(require('chai-bignumber')(BigNumber))
                   .should();

const Ebets = artifacts.require('ebets');
const Bet = artifacts.require('Bet');
const TeamBet = artifacts.require('TeamBet');
const Monarchy = artifacts.require('Monarchy');

const BET_STATES = {
  OPEN: 0,
  TEAM_ZERO_WON: 1,
  TEAM_ONE_WON: 2,
  DRAW: 3,
  UNDECIDED: 4,
  CALLED_RESOLVER: 5
};
const oneEther = new BigNumber(web3.toWei(1, 'ether'));
const twoEther = new BigNumber(web3.toWei(2, 'ether'));


contract('Bet', accounts => {
  const monarch = accounts[0];
  const betOwner = accounts[1];
  const user0 = accounts[2];
  const user1 = accounts[3];

  let arbiterInstance;
  let betInstance;
  let team0Instance;
  let team1Instance;
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
    const day = 60 * 60 * 24;
    const team0Name = 'Team 0';
    const team1Name = 'Team 1';

    const now = Math.floor(Date.now() / 1000);

    /*
     * Bet -- Match begin -- Match end -- Arbiter deadline -- Appeals deadline -- Self destruct deadline --
     * Now --  now + 2d  --  now + 4d --     now + 6d      --     now + 8d     --        now + 10d        --
    */

    const timestampMatchBegin = now + 2*day;
    const timestampMatchEnd = timestampMatchBegin + 2*day;
    const timestampArbiterDeadline = timestampMatchEnd + 2*day;
    const timestampAppealsDeadline = timestampArbiterDeadline + 2*day;
    const timestampSelfDestructDeadline = timestampAppealsDeadline + 2*day;
    const timestamps = [
      timestampMatchBegin, timestampMatchEnd, timestampArbiterDeadline,
      timestampAppealsDeadline, timestampSelfDestructDeadline
    ];
    const betTax = 1;  // 1% tax

    betInstance = await Bet.new(
        monarch, team0Name, team1Name, timestamps, betTax, {from: betOwner});

    team0Instance = await TeamBet.at(await betInstance.team0());
    team1Instance = await TeamBet.at(await betInstance.team1());

    // Bet is initialized open
    assert.isTrue(await betInstance.betState() == BET_STATES.OPEN);
    // Monarch is the arbiter
    assert.isTrue(await betInstance.arbiter() == monarch);
  });

  it('User 0 should bet on team 0', async () => {
    await team0Instance.sendTransaction(
        {from: user0, value: web3.toWei(1, 'ether'), gas: 100000});
    const amountBet = await team0Instance.betsToTeam(user0);
    amountBet.should.be.bignumber.equal(oneEther);
  });

  it('User 1 should bet on team 1', async () => {
    await team1Instance.sendTransaction(
        {from: user1, value: web3.toWei(2, 'ether'), gas: 100000});
    const amountBet = await team1Instance.betsToTeam(user1);
    amountBet.should.be.bignumber.equal(twoEther);
  });

  it('Should wait 3 days, so match begins', async () => {
    console.log('[Match begun]'.yellow);
    await waitNDays(3);
  });

  it('Users should not be able to bet', async () => {
    try {
      await team0Instance.sendTransaction(
          {from: user0, value: web3.toWei(1, 'ether'), gas: 100000});
    } catch (e) {
      assertRevert(e);
    }
  });

  it('Should wait 2 days, so match ends', async () => {
    console.log('[Match ended]'.yellow);
    await waitNDays(2);
  });

  it('User can call the arbiter', async () => {
    await betInstance.updateResult({from: user0, gas: 3000000});

    // assert.isTrue(await betInstance.betState() == BET_STATES.CALLED_RESOLVER);
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
