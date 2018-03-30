/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import Web3 from 'web3'

class Web3Service {
  static instance;

  constructor() {
    if (Web3Service.instance) {
      return Web3Service.instance;
    }

    Web3Service.instance = this;

    this.getWeb3().then(results => {
      this.web3 = results.web3js
      this.provider = results.provider;
      this.selectedAccount = results.selectedAccount;
      this.networkId = results.networkId;
      this.networkName = results.networkName;
    })
  }

  connectToLocal = async () => {
    const pr = new Web3.providers.HttpProvider('http://localhost:8545');
    const web3js = new Web3(pr);
    const provider = 'local';
    await web3js.eth.getBlockNumber();
    return {web3js, provider};
  }

  connectToBrowser = async () => {
    let provider;
    if (typeof web3 === 'undefined') {
      throw new Error('Failed to connect to browser provider');
    }
    if (window.web3.currentProvider.isMetaMask)
      provider = 'metamask';
    else
      provider = 'native';
    const web3js = new Web3(window.web3.currentProvider);
    return {web3js, provider};
  }

  connectToInfura = async () => {
    const pr = new Web3.providers.HttpProvider('https://kovan.infura.io/DM5TjoIO6E0LEkDkYDtd');
    const provider = 'infura';
    const web3js = new Web3(pr);
    return {web3js, provider};
  }

  tryAllProviders = async () => {
    let results;
    // Try in order Local, browser, infura
    try {
      results = await this.connectToLocal();
    }
    catch(err) {
      console.log('[web3] Local node not found');
      try {
        results = await this.connectToBrowser();
      }
      catch(err) {
        console.log('[web3] Browser node not found');
        results = await this.connectToInfura();
      }
    }
    return results;
  };

  getWeb3 = async (params = null) => {
    let results = null;
    if (params === null)
      results = await this.tryAllProviders();

    else if (params.provider === 'local') {
      try {
        console.log('[web3] Trying to connect to local');
        results = await this.connectToLocal();
      }
      catch(err) {
        console.error('[web3] Failed to connect to local');
        results = await this.tryAllProviders();
      }
    }
    else if (params.provider === 'metamask' || params.provider === 'native') {
      try {
        console.log('[web3] Trying to connect to native');
        results = await this.connectToBrowser();
      }
      catch(err) {
        console.error('[web3] Failed to connect to native');
        results = await this.tryAllProviders();
      }
    }
    else if (params.provider === 'infura') {
      try {
        console.log('[web3] Trying to connect to infura');
        results = await this.connectToInfura();
      }
      catch(err) {
        console.error('[web3] Failed to connect to infura');
        results = await this.tryAllProviders();
      }
    }

    const networkId = await results.web3js.eth.net.getId();
    let networkName = null;
    if (networkId === 1)
      networkName = 'Main Ethereum';
    else if (networkId === 3)
      networkName = 'Ropsten';
    else if (networkId === 4)
      networkName = 'Rinkeby';
    else if (networkId === 42)
      networkName = 'Kovan';
    else
      networkName = 'Private';

    let accounts = await results.web3js.eth.getAccounts();
    let selectedAccount;
    if (accounts) {
      selectedAccount = accounts[0];
    }

    window.web3js = results.web3js;
    return {...results, selectedAccount, networkId, networkName};
  }

  getCurrentProvider() {
    return this.web3.currentProvider;
  }
}

const web3Service = new Web3Service()

export default web3Service