const Web3 = require('web3');
const fs = require('fs');

const MonarchyABI = JSON.parse(fs.readFileSync('./compiledContracts/Monarchy.abi'));
const MonarchyBin = `0x${fs.readFileSync('./compiledContracts/Monarchy.bin').toString()}`
const EbetsABI = JSON.parse(fs.readFileSync('./compiledContracts/Ebets.abi'));
const EbetsBin = `0x${fs.readFileSync('./compiledContracts/Ebets.bin').toString()}`
const SimpleTokenABI = JSON.parse(fs.readFileSync('./compiledContracts/SimpleToken.abi'));
const SimpleTokenBin = `0x${fs.readFileSync('./compiledContracts/SimpleToken.bin').toString()}`

var MonarchyJSON = require('./build/contracts/Monarchy.json');
var EbetsJSON = require('./build/contracts/Ebets.json');
var SimpleToken1JSON = require('./build/contracts/SimpleToken1.json');
var SimpleToken2JSON = require('./build/contracts/SimpleToken2.json');

const deployAddress = '0x82De95A2c2805731a404C4F652514929cdB463bb';

var web3 = new Web3('http://localhost:8545');

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
    const monarchyObj = {
      address: monarchyAddress,
      updated_at: now
    }
    MonarchyJSON.networks[networkId] = monarchyObj;
    MonarchyJSON['unlinked_binary'] = MonarchyBin;
    MonarchyJSON['abi'] = MonarchyABI;
    fs.writeFileSync('./build/contracts/Monarchy.json', JSON.stringify(MonarchyJSON, undefined, 2));
    console.log('Deployed');

    console.log('Deploying Ebets...');
    const ebetsAddress = await deployContract(EbetsABI, EbetsBin, deployAddress);
    const ebetsObj = {
      address: ebetsAddress,
      updated_at: now
    }
    EbetsJSON['unlinked_binary'] = EbetsBin;
    EbetsJSON['abi'] = EbetsABI;
    EbetsJSON.networks[networkId] = ebetsObj;
    fs.writeFileSync('./build/contracts/Ebets.json', JSON.stringify(EbetsJSON, undefined, 2));
    console.log('Deployed');

    console.log('Deploying ERC20 SimpleToken1...');
    const simpleToken1Address = await deployContract(SimpleTokenABI, SimpleTokenBin, deployAddress);
    const simpleToken1Obj = {
      address: simpleToken1Address,
      updated_at: now
    }
    SimpleToken1JSON['unlinked_binary'] = SimpleTokenBin;
    SimpleToken1JSON['abi'] = SimpleTokenABI;
    SimpleToken1JSON.networks[networkId] = simpleToken1Obj;
    fs.writeFileSync('./build/contracts/SimpleToken1.json', JSON.stringify(SimpleToken1JSON, undefined, 2));
    console.log('Deployed');
    

    console.log('Deploying ERC20 SimpleToken2...');
    const simpleToken2Address = await deployContract(SimpleTokenABI, SimpleTokenBin, deployAddress);
    const simpleToken2Obj = {
      address: simpleToken2Address,
      updated_at: now
    }
    SimpleToken2JSON['unlinked_binary'] = SimpleTokenBin;
    SimpleToken2JSON['abi'] = SimpleTokenABI;
    SimpleToken2JSON.networks[networkId] = simpleToken2Obj;
    fs.writeFileSync('./build/contracts/SimpleToken2.json', JSON.stringify(SimpleToken2JSON, undefined, 2));
    console.log('Deployed');

    process.exit();
    //console.log(monarchyAddress);
  }
  catch(err) {
    console.error(err);
  }
}

deployAll();
