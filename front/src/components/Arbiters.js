import _ from 'lodash';

import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';
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

  static arbiters(withOther = false){
    var arbiters =  _.keys(ArbitersJson).map(arbiter => { return(
      <Badge key={ArbitersJson[arbiter][NETWORK_ID].address} 
        style={{ padding: 0, height: 40 }}
        badgeStyle={{ bottom: 25, left: 70 }}
        badgeContent={<IconButton tooltip='Verified!'><DoneIcon color={greenA200}/></IconButton>}
      >
      {arbiter}
      </Badge>
    )})
    if (withOther)
      arbiters.push(
      <Badge key={'other'} 
          style={{ padding: 0, height: 40 }}
          badgeStyle={{ bottom: 25, left: 40 }}
          badgeContent={<IconButton tooltip='Not verified!'><WarningIcon color={red500}/></IconButton>}
        >Other
        </Badge>);
    return arbiters;
  }

  render() {
    return null;
  }
}

export default Arbiters;
