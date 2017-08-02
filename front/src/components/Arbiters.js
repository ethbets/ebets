import _ from 'lodash';

import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';
import MenuItem from 'material-ui/MenuItem';
import DoneIcon from 'material-ui/svg-icons/action/done';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500, greenA200} from 'material-ui/styles/colors';

import ArbitersJson from 'utils/ebetsArbiters.json';
// CHANGE THIS WHEN THE NETWORK IS MAINNET
const NETWORK_ID = '42';

class Arbiters extends Component {
  constructor(props) {
    super(props);
  }

  static getArbiterInfo(arbiterInfo){
    var badgeContent;
    if (arbiterInfo.verified)
      badgeContent = <IconButton tooltip='Verified!' href='#/arbiters'><DoneIcon color={greenA200}/></IconButton>
    else
      badgeContent = <IconButton tooltip='Not verified'><WarningIcon color={red500}/></IconButton>
    return () => (
      <div>
        <Badge
          badgeContent={badgeContent}
        >
        Using arbiter {arbiterInfo.name}
        </Badge>
    </div>
    )
  }

  static isVerifiedArbiter(address){
    for (var arbiter in ArbitersJson) {
      if (ArbitersJson[arbiter][NETWORK_ID].address === address)
        return true;
      return false;
    }
  }

  static addressOf(arbiter, networkId = NETWORK_ID){
    return ArbitersJson[arbiter][networkId].address
  }

  static setVerifiedIcon(address) {
    if (this.isVerifiedArbiter(address)) {
      return <IconButton tooltip='Verified!'><DoneIcon color={greenA200}/></IconButton>
    }
    return <IconButton tooltip='Not verified!'><WarningIcon color={red500}/></IconButton>
  }

  static arbiters() {
    return _.reduce(ArbitersJson, (ourArbiters, networks, name) => {
      ourArbiters.push({
          key: (
            <MenuItem
              primaryText={name}
              secondaryText={this.setVerifiedIcon(networks[NETWORK_ID].address)}
            />
          ),
          value: networks[NETWORK_ID].address
      })
      return ourArbiters;
    }, []);
  }

  //TODO: receive address as props and put addresses in state to dinamic
  // control new unverified addresses
  addUnverifiedArbiter = (address) => {
    this.setState((prevState, props) => ({
      arbiters: prevState.arbiters.push({
        key: (
          <MenuItem
            primaryText={'other'}
            secondaryText={this.setVerifiedIcon(address)}
          />
        ),
        value: address
      })
    }));
  }

  render() {
    return null;
  }
}

export default Arbiters;
