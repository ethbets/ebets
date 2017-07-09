import React, { Component } from 'react'

import EbetsJson from '../build/contracts/ebets.json'
import getWeb3 from '../utils/getWeb3'

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

        // Stores a given value, 5 by default.
        //console.log(ebetsContractInstance);
        //events
        var betsEvents = ebetsContractInstance.allEvents({fromBlock: 0, toBlock: 'latest'});
        //console.log(betsEvents);
        betsEvents.watch((error, response) => {
          this.state.bets.push(response.address);
          console.log(this.state.bets);
        });
      });
    });
  }

  render() {
    const listItems = this.state.bets.map((bet) => 
      <li>{bet}</li>
    );
    return (
      <ul>
        {listItems}
      </ul>
    );
  }
}

export default Ebets
