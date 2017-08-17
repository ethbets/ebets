/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

/*global web3:true */
import React, { Component } from 'react';

import EbetsJson from 'build/contracts/Ebets.json';
import Bet from 'components/Bet';
import PropTypes from 'prop-types';
import {getParsedCategories} from 'utils/ebetsCategories';

class Ebets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bets: [],
      ebetsContractInstance: null
    }
  }

  getBetsByCategory = (category, ebetsContractInstance) => {
    console.log(ebetsContractInstance)
    return new Promise( async (resolve, reject) => {
      let betPromises = [];
      if (category === 'all_bets') {
        getParsedCategories().map(category => {
          betPromises.push(ebetsContractInstance.getBetsByCategory(category.key));
        });
      }
      else {
        betPromises = [ebetsContractInstance.getBetsByCategory(category)];
      }
      const bets = (await Promise.all(betPromises)).reduce((a, b) => {
        return a.concat(b);
      }, []);
      resolve(bets);
    });
  }
  
  componentWillMount() {
    this.instantiateContract();
  }
  componentWillUnmount () {
    if (this.state.betsEvents)
      this.state.betsEvents.stopWatching();
  }
  componentWillReceiveProps(nextProps) {
    const category = nextProps.routeParams.category;
    if (this.state.ebetsContractInstance !== null && 
        category !== undefined) {
      this.getBetsByCategory(category, this.state.ebetsContractInstance)
      .then(bets => {
        this.setState({bets: bets})
      });
    }
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
      var ebetsContractInstance;
      try {
        ebetsContractInstance = await ebetsContract.deployed();
      }
      catch(error) {
        console.error('Contract not deployed!');
        return;
      }
      var bets = await this.getBetsByCategory(this.props.routeParams.category, ebetsContractInstance);
      //events
      const betsEvents = ebetsContractInstance.allEvents({fromBlock: 'latest', toBlock: 'latest'});
      betsEvents.watch((error, response) => {
        if (response.args.category === this.props.routeParams.category)
          this.setState(previousState => ({bets: previousState.bets.concat(response.args.betAddr)}));
      })
      this.setState({
        bets: bets,
        //betsEvents: betsEvents,
        ebetsContractInstance: ebetsContractInstance
      });
    }
  );
  }

  render() {
    var { category, address } = this.props.routeParams;
    var listItems = [];
    if (category !== undefined) {
      if (this.props.routeParams.subcategory !== undefined)
        category = category + '/' + this.props.routeParams.subcategory;
      listItems = this.state.bets.map(bet => 
        <Bet key={bet}
            category={category}
            address={bet}
            showUnfeatured={this.context.showUnfeatured}
        />
      );
    }
    // Detailed bet
    if (address !== undefined) {
      listItems = <Bet category='detailed'
                       address={address} />
    }
    return (
      <ul style={{flexFlow: 'column', justifyContent: 'space-between'}}>
        {listItems}
      </ul>
    );
  }
}

Ebets.contextTypes = {
  showUnfeatured: PropTypes.bool
};

export default Ebets;
