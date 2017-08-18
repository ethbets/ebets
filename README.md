# Ebets
Ebets is a decentralized betting platform, built using Ethereum, where you
can create and join bets.

Ebets focuses on sports and e-sports matches. You can access it in a convenient way
at: [ebets.ch](https://ebets.ch) or at ipfs: 

## Running
You're right! To be fully decentralized you should be able to run it yourself,
It is supposed to be really simple:
```
cd front/
npm install
npm start
```
Open `http://127.0.0.1:8080/` and you're ready to use the system.

## Basics:
The contract roles are:

1. Ebets
2. User
3. Arbiter

#### Ebets
Ebets is used mainly to maintain the bets organized and indexed. We have a small fixed
fee for this service, 1% of the losing side.
Think of Ebets as a bets deposit: it will keep track of every bet created in the system,
and index them accordingly.

Ebets' power over a bet is very limited and it can only:

* Feature and unfeature a bet
* Change the bet's category

#### User
Users can:

* Create bets
* Bet on existing matches
* Call the arbiter
* Collect their rewards

A user can create bets in the system, and those bets appear in the *unfeatured* section.
A user can also bet on an existing match and collect the rewards of the bet.

#### Arbiter
The arbiter plays a major role in our system, make sure you understand how it works.

An arbiter is responsible to decide the match's outcome. The arbiter itself is also a contract.
For the first test release, we have a **Monarch** arbiter that decides the bet outcome, but
don't worry, you can trust this monarch (said every tyrant).

Our goal with the Monarch is just to bootstrap our community, as we encourage smart contract developers and the community
to follow our interface for developing arbiters. We will later create a nice UI so that non-programmers
can also develop arbiters.

Arbiters are formed usually by a collection of trustworthy people, and some rules should exist for them
to cast the outcome. For example, an arbiter can be composed by 3 members, where if 2 of them act
correctly, the match's outcome is decided. In that way arbiters can minimize the chance of *failing*.

##### What if an arbiter decides wrongly / doesn't decide?
Arbiters are encouraged to have a higher instance, like a court of appeals in legal terms. That court
of appeals could be evoked to solve a dispute when arbiters collude to lie about an outcome.
There should also be a *slashing* mechanism to punish the faulty arbiters. We are still working on these concepts before any implementation follows.

##### What if the higher instance colludes?
This is a recursive problem, we don't think there is an easy solution for that. We hope
that in higher instances the stakes are too high, and a collusion will do more damage than
any outcome it can provide. We hope that every bet will have their own *trustworthy court*.

But this is for the future! Right now we should all follow the Monarch, or whatever arbiter you can come
up with.

## Workflow

Bets represent a match between two teams, let's call them Team A and Team B. There can be, in principle, 3 outcomes:

1. Team A won
2. Team B won
3. Draw

Bets are accepted until the match begins. When the match begins, bets are no longer accepted.
When the match ends, any user can invoke the Arbiter, and that call will make a proposal to the arbiter to decide.
The arbiter then, must decide the outcome until a fixed deadline.
If the arbiter doesn't decide until then, anyone can make the bet a Draw.

Once the result of the match is decided, the participants that have bet on the winning team can withdraw their rewards.
The reward consists of the original bet plus a percentage of his/her stakes multiplied by the loser's side pool,
minus the 1% tax.
Let's say Alice bets 1 ether on team A and Bob 1 ether on team B. Team A wins.
When Alice withdraws, she will have 1 ether + 100% * (1-0.01) = 1.99 ether.

There is also a deadline when the bet can be self-destructed which is is encouraged to be long (couple of months).
When the bet is self-destroyed, any ether it holds is transferred to Ebets.

# Governance
This is a tool for us all to use.
We encourage the community to submit PRs to our repository and make suggestions in the Issues page. 

# TESTNET
The contracts are deployed in the **Kovan** testnet, so make sure you don't send any ether to the main network!

The system is unstable, so do not rely on the bets to be there in the following day, this is for testing only
right now!

# TODOs
- [ ] Support ERC20 tokens
- [ ] Make UI to create arbiters
- [ ] Option to create no-fee private bets
- [ ] Index bets by category in Ebets events
- [ ] Fix my bets
- [ ] Fix images for bets
- [ ] Better format BigNumber
- [ ] Fix "Win", sum with already bet by account, edit positioning
- [ ] Paginate bets

