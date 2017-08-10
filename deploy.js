const Web3 = require('web3');
const fs = require('fs');

const MonarchyABI = JSON.parse(fs.readFileSync('./compiledContracts/Monarchy.abi'));
const MonarchyBin = `0x${fs.readFileSync('./compiledContracts/Monarchy.bin').toString()}`
const EbetsABI = JSON.parse(fs.readFileSync('./compiledContracts/Ebets.abi'));
const EbetsBin = `0x${fs.readFileSync('./compiledContracts/Ebets.bin').toString()}`

var MonarchyJSON = require('./build/contracts/Monarchy.json');
var EbetsJSON = require('./build/contracts/Ebets.json');

const deployAddress = '0x82De95A2c2805731a404C4F652514929cdB463bb';

var web3 = new Web3('http://localhost:8545');

function deployContract(contractABI, contractBin, address) {
  return new Promise((resolve, reject) => {
    var monarchyContract = new web3.eth.Contract(contractABI);
    monarchyContract.deploy({
      data: contractBin
    }).send({
      from: address 
    })
    .on('error', () => {})
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
    const monarchyObj = {
      address: monarchyAddress,
      updated_at: now
    }
    MonarchyJSON.networks[networkId] = monarchyObj;
    fs.writeFileSync('./build/contracts/Monarchy.json', JSON.stringify(MonarchyJSON, undefined, 2));
    console.log('Deployed');

    console.log('Deploying Ebets...');
    const ebetsAddress = await deployContract(EbetsABI, EbetsBin, deployAddress);
    const ebetsObj = {
      address: ebetsAddress,
      updated_at: now
    }
    EbetsJSON.networks[networkId] = ebetsObj;
    fs.writeFileSync('./build/contracts/Ebets.json', JSON.stringify(EbetsJSON, undefined, 2));
    console.log('Deployed');

    process.exit();
    //console.log(monarchyAddress);
  }
  catch(err) {
    console.error(err);
  }
}

deployAll();
