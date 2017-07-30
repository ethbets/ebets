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
  }
}

export default EbetsArbiters;