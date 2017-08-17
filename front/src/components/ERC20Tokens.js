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
      {textKey: 'SimpleToken1', valueKey: '0xF8f30C544433B88D28cBB5c179649B7e435B65a2'},
      {textKey: 'SimpleToken2', valueKey: '0xF0aA51f81DB72F38a04290e1986701E743B529dF'}
    ];
  }

}

export default ERC20Tokens;
