/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

const Web3 = require('web3');
const fs = require('fs');

const MonarchyABI = JSON.parse(fs.readFileSync('./compiledContracts/Monarchy.abi'));
const MonarchyBin = `0x${fs.readFileSync('./compiledContracts/Monarchy.bin').toString()}`

const BetABI = JSON.parse(fs.readFileSync('./compiledContracts/Bet.abi'));
const BetBin = `0x${fs.readFileSync('./compiledContracts/Bet.bin').toString()}`

const EbetsABI = JSON.parse(fs.readFileSync('./compiledContracts/Ebets.abi'));
const EbetsBin = `0x${fs.readFileSync('./compiledContracts/Ebets.bin').toString()}`

const ERC20ABI = JSON.parse(fs.readFileSync('./compiledContracts/ERC20.abi'));
const ERC20Bin = `0x${fs.readFileSync('./compiledContracts/ERC20.bin').toString()}`

const SimpleToken1ABI = JSON.parse(fs.readFileSync('./compiledContracts/SimpleToken1.abi'));
const SimpleToken1Bin = `0x${fs.readFileSync('./compiledContracts/SimpleToken1.bin').toString()}`

const SimpleToken2ABI = JSON.parse(fs.readFileSync('./compiledContracts/SimpleToken2.abi'));
const SimpleToken2Bin = `0x${fs.readFileSync('./compiledContracts/SimpleToken2.bin').toString()}`

var MonarchyJSON = require('../build/contracts/Monarchy.json');
var BetJSON = require('../build/contracts/Bet.json');
var EbetsJSON = require('../build/contracts/Ebets.json');
var ERC20JSON = require('../build/contracts/ERC20.json');
var SimpleToken1JSON = require('../build/contracts/SimpleToken1.json');
var SimpleToken2JSON = require('../build/contracts/SimpleToken2.json');

const deployAddress = '0x82De95A2c2805731a404C4F652514929cdB463bb';

var web3 = new Web3('http://localhost:8545');

function writeBinABI(buildPath, jsonFile, networkId, address, abi, bin, timestamp) {
  const obj = {
    address: address,
    updated_at: timestamp
  }
  jsonFile.networks[networkId] = obj;
  jsonFile['bin'] = bin;
  jsonFile['abi'] = abi;
  fs.writeFileSync(buildPath, JSON.stringify(jsonFile, undefined, 2));
}

function deployContract(contractABI, contractBin, address) {
  return new Promise((resolve, reject) => {
    var monarchyContract = new web3.eth.Contract(contractABI);
    monarchyContract.deploy({
      data: contractBin
    }).send({
      from: address,
      gas: 3940000 
    })
    .on('error', (err) => {console.log('error', err)})
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
    const monarchyAddress = await deployContract(MonarchyABI, MonarchyBin, deployAddress);
    writeBinABI('./build/contracts/Monarchy.json', MonarchyJSON, 
                networkId, monarchyAddress, MonarchyABI, MonarchyBin, now);
    console.log('Deployed');

    console.log('Deploying Ebets...');
    const ebetsAddress = await deployContract(EbetsABI, EbetsBin, deployAddress);
    writeBinABI('./build/contracts/Ebets.json', EbetsJSON, 
                networkId, ebetsAddress, EbetsABI, EbetsBin, now);
    console.log('Deployed');

    console.log('Writing Bet file...');
    writeBinABI('./build/contracts/Bet.json', BetJSON, 
                networkId, undefined, BetABI, BetBin, now);
    console.log('Written');

    console.log('Writing ERC20 file...');
    writeBinABI('./build/contracts/ERC20.json', ERC20JSON,
                networkId, undefined, ERC20ABI, ERC20Bin, now);
    console.log('Written');
/*
    console.log('Deploying ERC20 SimpleToken1...');
    const simpleToken1Address = await deployContract(SimpleToken1ABI, SimpleToken1Bin, deployAddress);
    writeBinABI('./build/contracts/SimpleToken1.json', SimpleToken1JSON, 
                networkId, simpleToken1Address, SimpleToken1ABI, SimpleToken1Bin, now);
    console.log('Deployed');

    console.log('Deploying ERC20 SimpleToken2...');
    const simpleToken2Address = await deployContract(SimpleToken2ABI, SimpleToken2Bin, deployAddress);
    writeBinABI('./build/contracts/SimpleToken2.json', SimpleToken2JSON, 
                networkId, simpleToken2Address, SimpleToken2ABI, SimpleToken2Bin, now);
    console.log('Deployed');
    */

    process.exit();
  }
  catch(err) {
    console.error(err);
  }
}

deployAll();
