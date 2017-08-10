import React, { Component } from 'react';

class ERC20Tokens extends Component {
  constructor(props) {
    super(props);
  }

  static erc20tokens() {
    return [ { textKey: 'SimpleToken', valueKey: '0x86261273' }, ];
  }

}

export default ERC20Tokens;
