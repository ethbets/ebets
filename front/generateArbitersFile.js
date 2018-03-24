#!/usr/bin/env node
let Monarchy = require('../build/contracts/Monarchy.json');
let fs = require('fs');

let jsonFiles = {};

jsonFiles['Monarchy'] = {
  name: 'Monarchy', 
  description: 'The Monarchy contract consists of a single Arbiter that decides bets\' results'
}

for (let networkId in Monarchy.networks) {
  jsonFiles['Monarchy'][networkId] = {
    address: Monarchy.networks[networkId]['address']
  }
}

fs.writeFileSync('./src/utils/ebetsArbiters.json', JSON.stringify(jsonFiles));
