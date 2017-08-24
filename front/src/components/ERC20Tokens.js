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
      {textKey: 'SimpleToken1', valueKey: '0xe8F8f21f31D72e8E53E4B9075e9AD8a2c4DB62a5'},
      {textKey: 'SimpleToken2', valueKey: '0xB0856f4EA64a5d728E4aD2aC4CD4F4422d8dAF0C'}
    ];
  }

}

export default ERC20Tokens;
