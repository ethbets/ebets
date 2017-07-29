import contract from 'truffle-contract';
import MonarchyContract from 'build/contracts/Monarchy.json';

const EbetsArbiters = {

  isVerifiedArbiter : (arbiterAddress) => {
    // That is very naive, but is enough for now
    for (var networkId in  MonarchyContract.networks) {
      if (arbiterAddress === MonarchyContract.networks[networkId].address)
        return true;
    }
    return false;
  }
}

export default EbetsArbiters;