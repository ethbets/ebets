const Web3 = require('web3');
const fs = require('fs');

const MonarchyABI = JSON.parse(fs.readFileSync('./compiledContracts/Monarchy.abi'));
const MonarchyBin = `0x${fs.readFileSync('./compiledContracts/Monarchy.bin').toString()}`

const BetABI = JSON.parse(fs.readFileSync('./compiledContracts/Bet.abi'));
const BetBin = `0x${fs.readFileSync('./compiledContracts/Bet.bin').toString()}`

const EbetsABI = JSON.parse(fs.readFileSync('./compiledContracts/Ebets.abi'));
const EbetsBin = `0x${fs.readFileSync('./compiledContracts/Ebets.bin').toString()}`
const SimpleTokenABI = JSON.parse(fs.readFileSync('./compiledContracts/SimpleToken.abi'));
const SimpleTokenBin = `0x${fs.readFileSync('./compiledContracts/SimpleToken.bin').toString()}`

var MonarchyJSON = require('./build/contracts/Monarchy.json');
var BetJSON = require('./build/contracts/Bet.json');
var EbetsJSON = require('./build/contracts/Ebets.json');
var SimpleToken1JSON = require('./build/contracts/SimpleToken1.json');
var SimpleToken2JSON = require('./build/contracts/SimpleToken2.json');

const deployAddress = '0x82De95A2c2805731a404C4F652514929cdB463bb';

var web3 = new Web3('http://localhost:8545');

function writeBinABI(buildPath, jsonFile, networkId, address, abi, bin, timestamp) {
  const obj = {
    address: address,
    updated_at: timestamp
  }
  jsonFile.networks[networkId] = obj;
  jsonFile['unlinked_binary'] = bin;
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

    console.log('Writing on Bet file...');
    writeBinABI('./build/contracts/Bet.json', BetJSON, 
                networkId, undefined, BetABI, BetBin, now);
    console.log('Deployed');

    console.log('Deploying ERC20 SimpleToken1...');
    const simpleToken1Address = await deployContract(SimpleTokenABI, SimpleTokenBin, deployAddress);
    writeBinABI('./build/contracts/SimpleToken1.json', SimpleToken1JSON, 
                networkId, undefined, SimpleTokenABI, SimpleTokenBin, now);
    console.log('Deployed');
    
    console.log('Deploying ERC20 SimpleToken2...');
    const simpleToken2Address = await deployContract(SimpleTokenABI, SimpleTokenBin, deployAddress);
    writeBinABI('./build/contracts/SimpleToken2.json', SimpleToken2JSON, 
                networkId, undefined, SimpleTokenABI, SimpleTokenBin, now);
    console.log('Deployed');

    process.exit();
    //console.log(monarchyAddress);
  }
  catch(err) {
    console.error(err);
  }
}

deployAll();
