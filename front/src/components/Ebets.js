import React, { Component } from 'react';

import EbetsJson from '../build/contracts/ebets.json';
import getWeb3 from '../utils/getWeb3';

import Bet from 'components/Bet';

class Ebets extends Component {
  constructor(props) {
    super(props);
    console.log('called ebets');

    this.state = {
      bets: [],
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.');
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const ebetsContract = contract(EbetsJson);
    ebetsContract.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var ebetsContractInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      ebetsContract.deployed().then((instance) => {
        ebetsContractInstance = instance;

        //events
        var betsEvents = ebetsContractInstance.allEvents({fromBlock: 0, toBlock: 'latest'});

        betsEvents.watch((error, response) => {
          this.setState({ bets: this.state.bets.concat(response.args.bet_addr) });
        });
      });
    });
  }

  render() {
    const listItems = this.state.bets.map((bet) => 
      <Bet address={bet} key={bet.toString()} />
    );
    console.log("BETS", this.state.bets)
    return (
      <div>
        <ul className='card'>
          {listItems}
        </ul>
      </div>
    );
  }
}

export default Ebets;
