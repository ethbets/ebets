/*global web3:true */
import React, { Component } from 'react';

import EbetsJson from 'build/contracts/Ebets.json';
import Bet from 'components/Bet';

class Ebets extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      bets: [],
    }
  }

  getBets = (ebetsContractInstance) => {
    return new Promise((resolve, reject) => {
      var betEvents = ebetsContractInstance.allEvents({
        fromBlock: 0,
        toBlock: 'latest'});
      //this.setState({myBetsFilter: filter});
      betEvents.get((error, result) => {
        if (error) 
          reject(error);
        else {
          resolve(result.map((bet) => bet.args.betAddr));
        }
      });
    });
  }

  componentWillMount() {
    this.instantiateContract();
  }
  componentWillUnmount () {
    if (this.state.betsEvents !== null)
      this.state.betsEvents.stopWatching();
}

  async instantiateContract() {
    const contract = require('truffle-contract');
    const ebetsContract = contract(EbetsJson);
    ebetsContract.setProvider(web3.currentProvider);
    // Get accounts.
    web3.eth.getAccounts(async (error) => {
      if (error) {
        console.error('Error', error);
        return;
      }
      var ebetsContractInstance = await ebetsContract.deployed();
      //events
      const allBetsList = await this.getBets(ebetsContractInstance);
      const betsEvents = ebetsContractInstance.allEvents({fromBlock: 'latest', toBlock: 'latest'});
      betsEvents.watch((error, response) => {
        //console.log('eita', response);
        this.setState(previousState => {
          //console.log(previousState,response.args.betAddr)
          return {
            bets: previousState.bets.concat(response.args.betAddr) 
          }
        });
      });
      this.setState({ bets: allBetsList, betsEvents: betsEvents} );
    }
  );
  }

  render() {
    var {category, address} = this.props.routeParams;
    var listItems;
    if (category !== undefined) {
      if (this.props.routeParams.subcategory !== undefined)
        category = category + '/' + this.props.routeParams.subcategory;
      listItems = this.state.bets.map((bet) => 
        <Bet key={bet.toString()}
            category={category}
            address={bet}
        />
      );
    }
    if (address !== undefined) {
      listItems = <Bet category='detailed'
                       address={address} />
    }
    return (
      <div style={{marginLeft: 210}}>
        <h1 style={{marginLeft: 210}}>{this.props.location.pathname}</h1>
        <ul style={{flexFlow: 'column', justifyContent: 'space-between'}}>
          {listItems}
        </ul>
      </div>
    );
  }
}

export default Ebets;
