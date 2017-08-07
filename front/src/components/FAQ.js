import React, { Component } from 'react';
import HowDoesItWork from '../assets/imgs/Making-a-bet.png';

class FAQ extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{marginLeft: 280, marginTop: 90}}>
        <h4>You can find more information on <a href='https://github.com/ethbets/ebets'>github</a></h4>
        <ul>
          <li>How does it work?</li>
          <p>
            Users create bets including but not limited to "sports".
            Users can bet on created bets, after a pre determined time
            an arbiter can be summoned to tell the decision, this arbiter can be
            an oracle, or any smart contract. After the match is decided users
            can withdraw their prize or cry their loss.
          </p>
          <li>What are featured bets? What's the difference?</li>
          <p>
            Featured bets are bets that we, the owners do, or think are good enough to appear
            in the front pages. But anyone can create bets in our system, they will go to the
            unfeatured tab, because we cannot guarantee the integrity of the arbiter you choose.
          </p>
          <li>What are arbiters?</li>
          <p>
            This is where the critical part of our contracts reside, so make sure you
            understand what they are!
          </p>
          <p>
            We plan to create a set of governance smart contracts,
            so any one can become an arbiter by implementing our interface: <a 
              href='https://github.com/ethbets/ebets/blob/master/contracts/governanceInterface.sol'>
            governanceInterface.sol</a>.
            We aim for every comunity implementing a smart contract for their own sports,
            when there is a conflict, there is going to be a higher instance that can arbitrate,
            much likely how the actual judiciary systems work nowadays.
          </p>
          <p>
            By doing this, you can create your own private bets without loss of generality,
            for instance, if Alice and Bob want to do a fart competition, and they choose Charlie,
            Danniel and Emily to arbitrate the outcome.
            Charlie, Danniel and Emily, are going to witness the fart competition, and later can decide
            on the outcome together. The contract can be, for example, one that can only decide on the outcome
            when a simple majority is reached, minimizing the chance of collusion among the arbiters.
          </p>

          <li>Are you a prediction market?</li>
          <p>Not necessarily</p>
          <li>Do you have a colored-paper?</li>
          <p>
            We have a bunch of published papers if you want! They neither qualify nor disqualify
            the Dapp, you can read the Dapp's code in github.
          </p>
          <li>Why are you doing this?</li>
          <p>We want bets, and we want them now!
            No ICO, no bullshit! This is a very simple (and we believe well writen) set of contracts
            that perform simple tasks, make sports bets accessible.
          </p>
          <li>What are the fees?</li>
          <p>
            1% of the loosing side, this will be always transparent to the user.
          </p>
          <li>How do you guarantee not to steal my money?</li>
          <p>
            The only attack we can do is bet a lot of ether in a team
            and lie in the arbiter part, saying that that team won.
            We plan to outsource and build a comunity of arbiters for
            the each bet category to overcome this issue.
          </p>
          <li>How do I play?</li>
          <p>
            You need to connect to ethereum with your favorite client and execute the contracts.
          </p>
          <li>What if I don't withdraw when I win?</li>
          <p>
            If the arbiter doesn't arbitrate in time, the match is said to be draw,
            and the users can withdraw what they bet. After a period, the contract can
            be self-destructed and we collect the bet as fees.
          </p>
          <li>Do you plan on going in the live network?</li>
          <p>Yes</p>
          <li>Why your website is ugly?</li>
          <p>It works, doesn't it?</p>
          <li>Where are the contracts?</li>
          <p>In <a href='https://github.com/ethbets/ebets/blob/master/contracts/'>github</a></p>
        </ul>
        {/* <img style={{flex: 1, resizeMode: 'contain'}} src={HowDoesItWork} /> */}
      </div>
    );
  }
}

export default FAQ;
