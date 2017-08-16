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
    return [ {textKey: 'Ether (default)', valueKey: ''}, { textKey: 'SimpleToken', valueKey: '0x86261273' }, ];
  }

}

export default ERC20Tokens;
