/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/
import Web3Service from 'services/Web3Service';

export async function deployContract(contractJson, parameters, from) {
  const contract = new Web3Service.web3.eth.Contract(contractJson.abi, {
    data: contractJson.bin,
    from
  });
  let gas = await contract.deploy({ arguments: parameters }).estimateGas();
  gas = parseInt(gas * 1.1); // Give 10% more gas
  return new Promise((resolve, reject) => {
    resolve({ gas, contract: contract.deploy({ arguments: parameters }) })
    // TODO: Reject when gas limit exceeded
  });
}

export async function createBet(EbetsContractJson, parameters, from, networkId) {
  const contract = new  Web3Service.web3.eth.Contract(
    EbetsContractJson.abi,
    EbetsContractJson['networks'][networkId].address, 
    { from }
  );
  let gas = await contract.methods.createBet(...parameters).estimateGas();
  gas = parseInt(gas * 1.1); // Give 10% more gas
  return new Promise((resolve, reject) => {
    resolve({ gas, contract: contract.methods.createBet(...parameters) })
    // TODO: Reject when gas limit exceeded
  });
}