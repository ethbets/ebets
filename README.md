# Ebets
Ebets aims to be a decentralized platform, built using Ethereum, where you
can create and bet on anything that has two outcomes.

Ebets was tailored to create sports games, you can access it in a convenient way
at: (ebets.ch)[https://ebets.ch] or at ipfs: 

## Running
So you're right! To be fully decentralized you should be able to run it by yourself,
it is supposed to be really simple:
```
cd front/
npm install
npm start
```

## Basics:
The contract roles are:

1. Ebets
2. User
3. Arbiter

#### Ebets
Ebets is used mainly to maintain the bets organized and indexed, we have a small fixed
fee for this service, 1% of the losing side.
Think of Ebets as a bets deposit, it will keep track of every bet created in the system,
and index them accordingly.

The Ebets' power over a bet is very limited and it can only:

* Feature and unfeature a bet
* Change bet's category

#### User
User can:

* Create bets
* Bet
* Call arbiter
* Collect rewards

A user can create bets in the system, those bets are going to the *unfeatured* part of the tool.
A user can bet and collect the rewards of the bet.

#### Arbiter
The arbiter plays a major role in our system, make sure you understand how does it work.

An arbiter is responsible to decide on the match outcome, the arbiter itself is also a contract,
for this first test release, we have a **Monarch** arbiter that decides the bet outcomes, but
don't worry, you can trust this monarch (said every tyrant).

The Monarch is just to bootstrap our community, we encourage smart-contract developers and the community
to follow our interface for developing arbiters. Later we will do a nice interface so non-programmers
can also develop arbiters.

Arbiters are formed usually by a collection of trustworthy people, and some rule should exist for them
to cast the outcome, for example, an arbiter can be composed by 3 members, where if 2 of them act
correctly, the match's outcome is decided. In that way arbiters can minimize the chance of *failing*.

##### What if an arbiter decides wrongly / don't decide?
Arbiters are encouraged to have a higher instance, like a court of appeals in legal terms. That court
of appeals could be evoked to solve a dispute when arbiters collude to lie about an outcome.
There should also be a *slashing* mechanism to punish the faulty arbiters, at this point we didn't
tough about it.

##### What if the higher instance colludes?
So this is a recursive problem, we don't think there is an easy solution for that, we hope
that in higher instances the stakes are too high, and a collusion will do more damage than
any outcome it can provide. We hope that every bet will have their own *trustworthy court*.

But this is for the future! Right now we should all follow the Monarch, or whatever arbiter you can come
up with.

## Workflow

Bets should be composed by two players, let's call them Team A and Team B. There can be, in principle, 3 outcomes:

1. Team A won
2. Team B won
3. Draw

Bets are accepted until the match begins, when the match begins, bets are no longer accepted
When the match ends, any user can call the Arbiter, that call will make a proposal to the arbiter to decide.
The arbiter then, must decide in the outcome until a fixed deadline.
If the arbiter doesn't decide until then, anyone can make the bet a Draw.

Once we have the result of the match. The winning player can withdraw the rewards.
The reward consists of the original bet plus a percentage of his/her stakes multiplied by the loser's side pool,
minus the 1% tax.
Let's say Alice puts 1 ether in team A and Bob 1 ether in team B. Team A wins.
When Alice withdraws, she will have 1 ether + 100% * (1-0.01) = 1.99 ether.

There is also a deadline when the bet can be self-destructed, this is encouraged to be long (couple of months),
when the bet is self-destroyed, any holdings it has goes to the Ebets system.

# Governance
This is a tool for us all to use.
We encourage the community to submit PRs to our repository and make suggestions in the Issues page. 

# TESTNET
The contracts are deployed in the **Kovan** testnet, make sure you don't send any ether to the main network!

The system is unstable, so do not rely on the bets to be there in the following day, this is for testing only
right now!

# TODOs
* Support ERC20 tokens
* Make interface to create arbiters
* Index bets by category in Ebets events
* Fix my bets
* Fix images for bets
* Better format BigNumber
* Fix "Win", sum with already bet by account, edit positioning
* Paginate front page

