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
      {textKey: 'SimpleToken1', valueKey: '0x7B7F39C5f0eeb0b7Cd8d3E5BD1A8f786a5F5C78e'},
      {textKey: 'SimpleToken2', valueKey: '0xB0856f4EA64a5d728E4aD2aC4CD4F4422d8dAF0C'}
    ];
  }

}

export default ERC20Tokens;
