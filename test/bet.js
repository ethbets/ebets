/* Copyright (C) 2017 ethbets
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
 */

import {assertRevert, BigNumber, getEvents, getUsedGas, increaseTimeTo, waitNDays} from './utils.js';

let usedGasStatistics = []

const logUsedGas = (operation, gas) => {
  usedGasStatistics[operation] = gas;
  //console.log(('\tUsed gas to ' + operation + ': ' + gas).cyan);
}

const should = require('chai')  // eslint-disable-line
                   .use(require('chai-as-promised'))
                   .use(require('chai-bignumber')(BigNumber))
                   .should();

const Ebets = artifacts.require('Ebets');
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
const threeEther = new BigNumber(web3.toWei(3, 'ether'));

const betTax = 1;  // 1% tax

contract('Bet', accounts => {
  const monarch = accounts[0];
  const betOwner = accounts[1];
  const user0 = accounts[2];
  const user1 = accounts[3];
  const user2 = accounts[4];
  const user3 = accounts[5];

  let arbiterInstance;
  let betInstance;
  let team0Instance;
  let team1Instance;
  before(async () => {
    arbiterInstance = await Monarchy.new({from: monarch});
  });
  it('Should have arbiter as a member', async () => {
    assert.isTrue(await arbiterInstance.isMember(monarch));
  });

  it('Should create a bet', async () => {
    const day = 60 * 60 * 24;
    const team0Name = 'Team 0';
    const team1Name = 'Team 1';

    const now = Math.floor(Date.now() / 1000);

    const timestampMatchBegin = now + 2 * day;
    const timestampMatchEnd = timestampMatchBegin + 2 * day;
    const timestampArbiterDeadline = timestampMatchEnd + 2 * day;
    const timestampAppealsDeadline = timestampArbiterDeadline + 2 * day;
    const timestampSelfDestructDeadline = timestampAppealsDeadline + 2 * day;
    const timestamps = [
      timestampMatchBegin, timestampMatchEnd, timestampArbiterDeadline,
      timestampAppealsDeadline, timestampSelfDestructDeadline
    ];

    betInstance = await Bet.new(
        arbiterInstance.address, team0Name, team1Name, timestamps, betTax,
        {from: betOwner});
    logUsedGas('Create bet', await getUsedGas(betInstance.transactionHash));

    team0Instance = await TeamBet.at(await betInstance.team0());
    team1Instance = await TeamBet.at(await betInstance.team1());

    // Bet is initialized open
    assert.isTrue(await betInstance.betState() == BET_STATES.OPEN);
    // Monarch is the arbiter
    assert.isTrue(
        await Monarchy.at(await betInstance.arbiter()).isMember(monarch));

    console.log('[Bet created]'.yellow);
  });

  it('User 0 should bet on team 0', async () => {
    const tx = await team0Instance.sendTransaction(
        {from: user0, value: oneEther, gas: 100000});
    logUsedGas('Bet', await getUsedGas(tx.tx));
    
    const amountBet = await team0Instance.betsToTeam(user0);
    amountBet.should.be.bignumber.equal(oneEther);
  });

  it('User 1 should bet on team 0', async () => {
    await team0Instance.sendTransaction(
        {from: user1, value: twoEther, gas: 100000});
    const amountBet = await team0Instance.betsToTeam(user1);
    amountBet.should.be.bignumber.equal(twoEther);
  });

  it('User 2 should bet on team 1', async () => {
    await team1Instance.sendTransaction(
        {from: user2, value: oneEther, gas: 100000});
    const amountBet = await team1Instance.betsToTeam(user2);
    amountBet.should.be.bignumber.equal(oneEther);
  });

  it('Should wait 3 days, so match begins', async () => {
    console.log('[Match begun]'.yellow);
    await waitNDays(3);
  });

  it('Users should not be able to bet', async () => {
    try {
      await team0Instance.sendTransaction(
          {from: user0, value: oneEther, gas: 100000});
    } catch (e) {
      assertRevert(e);
    }
  });

  it('Should wait 2 days, so match ends', async () => {
    console.log('[Match ended]'.yellow);
    await waitNDays(2);
  });

  it('User can call the arbiter', async () => {
    const tx = await betInstance.updateResult({from: user0});
    logUsedGas('Call arbiter', await getUsedGas(tx.tx));
    // TODO: Assert events
    assert.equal(await betInstance.betState(), BET_STATES.CALLED_RESOLVER);
  });

  it('Non-arbiter cannot cast vote', async () => {
    try {
      await arbiterInstance.castVote(betInstance.address, 1, {from: user0});
    } catch (e) {
      assertRevert(e);
    }
  });

  it('Arbiter should say team 0 won', async () => {
    const tx =
        await arbiterInstance.castVote(betInstance.address, 1, {from: monarch});
    const events = getEvents(tx, 'ResolvedProposal');
    logUsedGas('Arbiter resolve', await getUsedGas(tx.tx));
    assert.equal(events[0].outcome, 1);
    assert.equal(await betInstance.betState(), BET_STATES.TEAM_ZERO_WON);
  });

  it('Should wait 2 days, so Arbiter time to decide end', async () => {
    console.log('[Arbiter time to decide ended]'.yellow);
    await waitNDays(2);
  });

  it('Should wait 2 days, so Appeals time end', async () => {
    console.log('[Appeals time ended]'.yellow);
    await waitNDays(2);
  });

  it('User 3 should be withdraw on behalf of user 0', async () => {
    const previousBalance = await web3.eth.getBalance(user0);
    let tx = await betInstance.withdraw(user0, false, {from: user3});
    logUsedGas('Withdraw bet', await getUsedGas(tx.tx));
    const userProfit = (await web3.eth.getBalance(user0)).sub(previousBalance);

    // balance should be:
    // prev + originalBet + ((share)*loserSum - tax * loserSum)
    // prev + 1 + 1*2 - 0.01*2 = prev + 2.8

    const profit = new BigNumber(web3.toWei('1.33', 'ether'));
    userProfit.should.be.bignumber.equal(profit);

    const events = getEvents(tx, 'Withdraw');
    assert.equal(events[0].winner, user0);
    events[0].amount.should.be.bignumber.equal(profit);
  });

  it('User 3 can withdraw only once', async () => {
    try {
      await betInstance.withdraw(user0, false, {from: user3});
    } catch (e) {
      assertRevert(e);
    }
  });

  it('User 3 should be withdraw on behalf of user 1', async () => {
    const previousBalance = await web3.eth.getBalance(user1);
    let tx = await betInstance.withdraw(user1, false, {from: user3});
    logUsedGas('Withdraw bet', await getUsedGas(tx.tx));
    const userProfit = (await web3.eth.getBalance(user1)).sub(previousBalance);

    // balance should be:
    // prev + originalBet + ((share)*loserSum - tax * loserSum)

    const profit = new BigNumber(web3.toWei('2.66', 'ether'));
    userProfit.should.be.bignumber.equal(profit);

    const events = getEvents(tx, 'Withdraw');
    assert.equal(events[0].winner, user1);
    events[0].amount.should.be.bignumber.equal(profit);
  });

  it('Should wait 2 days, so Selfdestruct time begin', async () => {
    console.log('[Selfdestruct time begin]'.yellow);
    await waitNDays(2);
  });

  it('Should terminate the bet', async () => {
    let profit = new BigNumber(web3.toWei('0.01', 'ether'));
    let terminateTx = await betInstance.terminate({from: user3});
    logUsedGas('Terminate bet', await getUsedGas(terminateTx.tx));

    const previousBalance = await web3.eth.getBalance(monarch);
    const tx = await arbiterInstance.getBalance({from: monarch, gasPrice: 1});
    const txCost = tx.receipt.gasUsed;
    profit = profit.sub(txCost);
    const arbiterProfit =
        (await web3.eth.getBalance(monarch)).sub(previousBalance);

    arbiterProfit.should.be.bignumber.equal(profit);
  });

  it('Prints gas statistics', async () => {
    const gasPrice = 20 * 1e9; // 20Gwei
    const ethereumPrice = 1200; // Dollar
    console.log('\nGas statistics:'.cyan);
    for (let operation in usedGasStatistics) {
      console.log(`${operation} : ${usedGasStatistics[operation]} -> \$${usedGasStatistics[operation]*gasPrice*ethereumPrice/1e18}`.cyan);
    }
  });
})
