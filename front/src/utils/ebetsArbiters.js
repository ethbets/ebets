import _ from 'lodash';
import ArbitersJson from './ebetsArbiters.json';
// CHANGE THIS WHEN THE NETWORK IS MAINNET
const NETWORK_ID = '42';
const EbetsArbiters = {
  isVerifiedArbiter: async (address) => {
    
    for (var arbiter in ArbitersJson) {
      if (ArbitersJson[arbiter][NETWORK_ID] === address)
        return true;
      return false;
    }
  },

  addresses: () => {
    let addresses = [];
    _.each(ArbitersJson, (networks, key) => {
      addresses.push(_.map(networks, 'address'));
    });
    return _.flattenDeep(addresses);
  }
}

export default EbetsArbiters;