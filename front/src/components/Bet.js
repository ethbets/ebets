import React, { Component } from 'react'

import BetJson from '../build/contracts/Bet.json'
import getWeb3 from '../utils/getWeb3'

class Bet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bet_state: '',
      is_featured: false,
      title: '',
      category: '',
      team_0: '',
      team_1: '',
      team_0_bet_sum: 0,
      team_1_bet_sum: 0,
      bets_to_team_0: {},
      bets_to_team_1: {},
      timestamp_match_begin: 0,
      timestamp_match_end: 0,
      timestamp_hard_deadline: 0,
      timestamp_terminate_deadline: 0,
      web3: null, // TODO: REMOVE WEB3, DO STATIC
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
      this.instantiateContract();
    })
    .catch((err) => {
      console.log('Error finding web3', err);
    })
  }

  instantiateContract() {
    var self = this;
    function setAttribute(attributeNames, contractInstance) {
      Object.keys(attributeNames).map(async (attr) => {
        if (attr != 'web3') { //FIXME: REMOVE ONCE WEB3 IS NOT HERE
          var obj = {};
          obj[attr] = await betContractInstance[attr]();
          obj[attr] = obj[attr].toString();
          self.setState(obj);
        }
      });
    }

    const contract = require('truffle-contract');
    //const betContract = contract({...BetJson, ...{address: this.props.address}});
    const betContract = contract(BetJson);
    betContract.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var betContractInstance = betContract.at(this.props.address);
    setAttribute(this.state, betContractInstance);

    betContractInstance.title(title => {console.log('TITLE', title);})

    var betEvents = betContractInstance.allEvents({fromBlock: 0, toBlock: 'latest'});
    betEvents.watch((error, response) => {
      console.log('Bet:', response.args.amount.toString());
      if (response.args.for_team == 0)
        this.state.team_0_bet_sum = +this.state.team_0_bet_sum + 30*(+response.args.amount);
      else
        this.state.team_1_bet_sum = +this.state.team_1_bet_sum + 30*(+response.args.amount);
    });
  }

  render() {
    return (
      <div>
        Addr: {this.props.address} <br/>
        {this.state.team_0} $: {this.state.team_0_bet_sum} <br/>
        {this.state.team_1} $: {this.state.team_1_bet_sum} <br/>
        title: {this.state.title} <br/>
        Category: {this.state.category} <br/>
        begins: {this.state.timestamp_match_begin} <br/>
      </div>
    );
  }
}

export default Bet;