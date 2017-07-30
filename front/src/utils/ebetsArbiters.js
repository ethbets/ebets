import _ from 'lodash';
import contract from 'truffle-contract';
import MonarchyContract from 'build/contracts/Monarchy.json';

let EbetsArbiters = {

  isVerifiedArbiter : (arbiterAddress) => {
    // That is very naive, but is enough for now
    for (var networkId in  MonarchyContract.networks) {
      if (arbiterAddress === MonarchyContract.networks[networkId].address)
        return true;
    }
    return false;
  },

  addresses: () => {
    return _.map(MonarchyContract.networks, 'address');
  }
}

export default EbetsArbiters;