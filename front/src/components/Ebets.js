import React, { Component } from 'react';

import EbetsJson from 'build/contracts/Ebets.json';
import getWeb3 from 'utils/getWeb3';

import Bet from 'components/Bet';

class Ebets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bets: [],
      web3: null
    }
  }

  componentWillMount() {
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
    const contract = require('truffle-contract');
    const ebetsContract = contract(EbetsJson);
    ebetsContract.setProvider(this.state.web3.currentProvider);
    // Get accounts.
    this.state.web3.eth.getAccounts((error) => {
      if (error) throw 'Unable to get accounts';
      ebetsContract.deployed()
      .then(instance => {
        //events
        var betsEvents = instance.allEvents({fromBlock: 0, toBlock: 'latest'});
        betsEvents.watch((error, response) => {
          this.setState(previousState => {
            return { bets: previousState.bets.concat(response.args.betAddr) }
          });
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
  }

  render() {
    var category = this.props.routeParams.category;
    if (this.props.routeParams.subcategory !== undefined)
      category = category + '/' + this.props.routeParams.subcategory;
    
    var listItems = this.state.bets.map((bet) => 
      <Bet key={bet.toString()}
      category={category}
      address={bet} 
      />
    );
    return (
      <div style={{marginLeft: 210}}>
        <h1 style={{marginLeft: 210}}>{this.props.location.pathname}</h1>
        <ul className='card'>
          {listItems}
        </ul>
      </div>
    );
  }
}

export default Ebets;
