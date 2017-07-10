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
      url_oraclize: '',
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
        if (attr !== 'web3' // FIXME: REMOVE ONCE WEB3 IS NOT HERE
            && attr !== 'bets_to_team_0' // Cannot get mapping keys, no prob: get from events
            && attr !== 'bets_to_team_1') { // idem
          var obj = {};
          obj[attr] = await betContractInstance[attr]();
          if (typeof obj[attr] === 'object') // Handle Big Number
            obj[attr] = obj[attr].toNumber();
          else
            obj[attr] = obj[attr].toString();
          self.setState(obj);
        }
      });
    }

    const contract = require('truffle-contract');
    const betContract = contract(BetJson);
    betContract.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var betContractInstance = betContract.at(this.props.address);
    setAttribute(this.state, betContractInstance);

    betContractInstance.title(title => {console.log('TITLE', title);})

    var betEvents = betContractInstance.new_bet({fromBlock: 0, toBlock: 'latest'});
    console.log(betEvents);
    betEvents.watch((error, response) => {
      console.log('Bet:', response.args);
      if (response.args.for_team === false)
        this.setState({ team_0_bet_sum : this.state.team_0_bet_sum + response.args.amount.toNumber() });
      else
        this.setState({ team_1_bet_sum : this.state.team_1_bet_sum + response.args.amount.toNumber() });
    });
  }

  render() {
    return (
      <div>
        <h3>Title: {this.state.title} </h3>
        Addr: {this.props.address} <br/>
        State: {this.state.bet_state} <br />
        Featured: {this.state.is_featured} <br />
        Team0 {this.state.team_0}: ${this.state.team_0_bet_sum} <br/>
        Team1 {this.state.team_1}: ${this.state.team_1_bet_sum} <br/>
        Category: {this.state.category} <br/>
        Begins: {this.state.timestamp_match_begin} <br/>
        Ends: {this.state.timestamp_match_end} <br/>
        Hard Deadline: {this.state.timestamp_hard_deadline} <br/>
        Terminate Deadline: {this.state.timestamp_terminate_deadline} <br/>
        Oracle: {this.state.url_oraclize}
      </div>
    );
  }
}

export default Bet;