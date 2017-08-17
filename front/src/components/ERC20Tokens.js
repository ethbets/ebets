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
      {textKey: 'SimpleToken1', valueKey: '0x57e5Ce2735E9DcB218F4e5E170801e5a151b507C'},
      {textKey: 'SimpleToken2', valueKey: '0x123eEEdF6aC9d3bC37aCdD5b5F282b22a204cD32'}
    ];
  }

}

export default ERC20Tokens;
