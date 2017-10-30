/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

/*global web3:true */
import React, { Component } from 'react';
import Paginate from 'react-paginate';

import EbetsJson from 'build/contracts/Ebets.json';
import BetList from 'components/BetList';
import PropTypes from 'prop-types';
import {getParsedCategories} from 'utils/ebetsCategories';

import 'assets/stylesheets/pagination.css';

class Ebets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bets: [],
      ebetsContractInstance: null,
      currentPage: 0,
      pageCount: 1
    }
  }

  getPageCount(bets) {
    return Math.ceil(bets.length / this.props.route.perPage)
  }

  getBetsByCategory = (category, ebetsContractInstance) => {
    console.log('get bet', category);
    return new Promise( async (resolve, reject) => {
      let betPromises = [];
      if (category === 'all_bets' || category === 'my_bets') {
        betPromises = getParsedCategories().map(category => ({
            bets: ebetsContractInstance.getBetsByCategory(category.key),
            category: category.key
        }));
      }
      else {
        betPromises = [{
          bets: ebetsContractInstance.getBetsByCategory(category),
          category: category
        }];
      }
      const bets = (await Promise.all(betPromises.map(betCat => (betCat.bets)))).reduce((before, bet, idx) => {
        return before.concat(bet.map(b => ({bet: b, category: betPromises[idx].category})));
      }, []);
      resolve(bets);
      this.setState({pageCount: this.getPageCount(bets)});
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
    var category = nextProps.routeParams.category;
    if (nextProps.routeParams.subcategory)
        category += '/' + nextProps.routeParams.subcategory;
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
    var ebetsContractInstance;
    try {
      ebetsContractInstance = await ebetsContract.deployed();
    }
    catch(error) {
      console.error('Contract not deployed!');
      return;
    }
    var category = this.props.routeParams.category;
    var bets = [];
    console.log(category)
    if (category !== undefined) {
      if (this.props.routeParams.subcategory)
        category += '/' + this.props.routeParams.subcategory;
      bets = await this.getBetsByCategory(category, ebetsContractInstance);
    }
    //events
    const betsEvents = ebetsContractInstance.allEvents({fromBlock: 'latest', toBlock: 'latest'});
    betsEvents.watch((error, response) => {
      if (response.args.category === this.props.routeParams.category)
        this.setState(previousState => ({bets: previousState.bets.concat(response.args.betAddr)}));
    })
    this.setState({
      bets: bets,
      //betsEvents: betsEvents,
      ebetsContractInstance: ebetsContractInstance,
      pageCount: this.getPageCount(bets)
    });
  }

  handlePageClick = (index) => {
    this.setState({ currentPage: index.selected });
  };

  displayedBets = () => {
    const initialPosition = this.state.currentPage * this.props.route.perPage;
    return this.state.bets.slice(initialPosition , initialPosition + this.props.route.perPage)
  }

  render() {
    return (
      <div>
        <BetList
          bets={this.displayedBets()}
          routeParams={this.props.routeParams}
          location={this.props.location}
        />
        {this.state.pageCount > 1 &&
          <Paginate
            pageCount={this.state.pageCount}
            marginPagesDisplayed={this.props.route.perPage}
            pageRangeDisplayed={this.state.pageCount}
            containerClassName={"pagination"}
            initialPage={this.state.currentPage}
            onPageChange={this.handlePageClick}
            activeClassName={"active"}
          />
        }
      </div>
    );
  }
}

Ebets.contextTypes = {
  showUnfeatured: PropTypes.bool,
  web3: PropTypes.object
};

export default Ebets;
