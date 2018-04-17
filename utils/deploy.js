/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

const Web3 = require('web3');
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
  version: '0.1.0',
  addHelp: true,
  description: 'Ebets contract deployment tool'
});
parser.addArgument('--address', {help: 'Deployment address'});

const args = parser.parseArgs();
const deployAddress = args['address'];

// Contracts
const MonarchyJSON = require('../build/Monarchy.json');
const EbetsJSON = require('../build/Ebets.json');

var web3 = new Web3('http://localhost:8545');

function updateNetworkInfo(buildPath, jsonFile, networkId, address, timestamp) {
  const network = {
    address: address,
    updated_at: timestamp
  }
  jsonFile.networks[networkId] = network;
  fs.writeFileSync(buildPath, JSON.stringify(jsonFile, undefined, 2));
}

function deployContract(contractABI, contractBin, address) {
  return new Promise((resolve, reject) => {
    var contract = new web3.eth.Contract(contractABI);
    contract.deploy({
      data: contractBin
    }).send({
      from: address,
      gas: 3940000 
    })
    .on('error', (err) => {console.log('Unexpected error occurred: ', err)})
    .on('confirmation', (block, tx) => {
      resolve(tx.contractAddress)
    })
    .catch(() => {});
  });
}

async function deployAll() {
  try{
    const networkId = await web3.eth.net.getId();
    const now = Date.now();
    console.log('Deploying in networkId:', networkId);

    console.log('Deploying Monarchy...');
    const monarchyAddress = await deployContract(MonarchyJSON.abi, MonarchyJSON.bytecode, deployAddress);
    updateNetworkInfo('../build/Monarchy.json', MonarchyJSON, networkId, monarchyAddress, now);
    console.log('Deployed');

    console.log('Deploying Ebets...');
    const ebetsAddress = await deployContract(EbetsJSON.abi, EbetsJSON.bytecode, deployAddress);
    updateNetworkInfo('../build/Ebets.json', EbetsJSON, networkId, ebetsAddress, now);
    console.log('Deployed');

    process.exit();
  }
  catch(err) {
    console.error(err);
  }
}

deployAll();
