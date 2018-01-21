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
    // TODO: Get default from configuration file
    this.web3 = new Web3(window.web3.currentProvider); // FIXME
    this.provider = 'MetaMask';
    this.selectedAccount = null;
    this.networkId = 42;
    this.networkName = 'Kovan';

    this.getWeb3().then(results => {
      this.web3 = results.web3
      this.provider = results.provider;
      this.selectedAccount = results.selectedAccount;
      this.networkId = results.networkId;
      this.networkName = results.networkName;
    })
  }

  getWeb3() {
    return new Promise((resolve, reject) => {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener('load', async function () {
        let results;
        let web3js;
        if (typeof web3 !== 'undefined') {
          let provider;
          if (window.web3.currentProvider.isMetaMask) {
            provider = 'MetaMask';
          } else {
            provider = 'Custom';
          }
          web3js = new Web3(window.web3.currentProvider);
          results = {
            web3: web3js,
            provider
          }
        } else {
          let wsProvider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws')
          web3js = new Web3(wsProvider);
          results = {
            web3: web3js,
            provider: 'Infura'
          }
          console.log('No web3 instance injected, using infura\'s provider');
        }
        let networkId = await web3js.eth.net.getId().catch(error => { reject(error); });
        let networkName = null;
        switch (networkId) {
          case 1:
            networkName = 'Main Ethereum';
            break;
          case 3:
            networkName = 'Ropsten';
            break;
          case 4:
            networkName = 'Rinkeby';
            break;
          case 42:
            networkName = 'Kovan';
            break;
          default:
            networkName = 'Private';
            break;
        }
        let accounts = await web3js.eth.getAccounts();
        let selectedAccount;
        if (accounts) {
          selectedAccount = accounts[0];
        }
        resolve({ ...results, selectedAccount, networkId, networkName });
      })
    })
  }

  getCurrentProvider() {
    return this.web3.currentProvider;
  }
}

const web3Service = new Web3Service()

export default web3Service