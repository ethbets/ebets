/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import React, { Component } from 'react';

class ERC20Tokens extends Component {
  constructor(props) {
    super(props);
  }

  static erc20tokens() {
    return [
      {textKey: 'Ether (default)', valueKey: ''},
      {textKey: 'Gnosis Token', valueKey: '0xc73d78870ba5a3eaddc2be371af09b2c429cb2ca'},
      {textKey: 'Golem Network Token', valueKey: '0x08c24283f0b6c07ff9793a1b8534a49b32c07e73'},
      {textKey: 'Rep Token', valueKey: '0x64af87a36a407732320c4dc1852debc60cd81c5e'},
      {textKey: 'Melon Token', valueKey: '0x2a20ff70596e431ab26c2365acab1b988da8eccf'},
      {textKey: 'Litecoin Token', valueKey: '0xf051264ab9046fd73cbd00df5e732d2ca78ee704'},
      {textKey: 'Basic Attention Token', valueKey: '0xfee1d0dc0b5b6f2f20d8e9f7e95e9e367e4a61a7'}
/*
      {textKey: 'SimpleToken1', valueKey: '0xe8F8f21f31D72e8E53E4B9075e9AD8a2c4DB62a5'},
      {textKey: 'SimpleToken2', valueKey: '0xB0856f4EA64a5d728E4aD2aC4CD4F4422d8dAF0C'}
*/
    ];
  }

}

export default ERC20Tokens;
