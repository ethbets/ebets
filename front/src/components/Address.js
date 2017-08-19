import React, { Component } from 'react';
import MenuItem from 'material-ui/MenuItem';
import EthereumBlockies from 'ethereum-blockies';

import Arbiters from 'components/Arbiters';

class Address extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const { address } = this.props;
    const imgURL = EthereumBlockies.create({
      seed: address.toLowerCase(),
      spotcolor: -1,
      size: 8,
      scale: 4,
    }).toDataURL();

    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <img src={"data:image/jpeg;" + imgURL} />{address}
      </div>
    );
  }

  static getArbiterMenuList = (address, name, networkId) => {
    const imgURL = EthereumBlockies.create({
      seed: address.toLowerCase(),
      spotcolor: -1,
      size: 8,
      scale: 4,
    }).toDataURL();

    return (
      <MenuItem
        primaryText={name}
        leftIcon={<img src={"data:image/jpeg;" + imgURL} />}
        secondaryText={Arbiters.setVerifiedIcon(address, networkId)}
      />
    );
  }

}

export default Address;