#!/usr/bin/env node
var Monarchy = require('../build/contracts/Monarchy.json');
var fs = require('fs');

jsonFiles = {};

jsonFiles['Monarchy'] = {
  name: 'Monarchy', 
  description: 'The Monarchy contract have a single Arbiter that can decide on the bet outcomes'
}

for (var networkId in Monarchy.networks) {
  jsonFiles['Monarchy'][networkId] = {
    address: Monarchy.networks[networkId]['address']
  }
}

fs.writeFileSync('./src/utils/ebetsArbiters.json', JSON.stringify(jsonFiles));
