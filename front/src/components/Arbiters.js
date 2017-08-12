import _ from 'lodash';

import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';
import MenuItem from 'material-ui/MenuItem';
import DoneIcon from 'material-ui/svg-icons/action/done';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500, greenA200} from 'material-ui/styles/colors';

import EthereumBlockies from 'ethereum-blockies';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import ArbitersJson from 'utils/ebetsArbiters.json';
// CHANGE THIS WHEN THE NETWORK IS MAINNET
const NETWORK_ID = '42';
const NETWORK_IDS = ['42', '3'];

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
      <Badge
        badgeContent={badgeContent}
      >
      Using arbiter {arbiterInfo.name}
      </Badge>
    )
  }

  static isVerifiedArbiter(address, networkId){
    for (var arbiter in ArbitersJson) {
      if (ArbitersJson[arbiter][networkId].address.toLowerCase() === address.toLowerCase())
        return true;
      return false;
    }
  }

  static addressOf(arbiter, networkId = NETWORK_ID){
    return ArbitersJson[arbiter][networkId].address
  }

  static setVerifiedIcon(address, networkId) {
    if (this.isVerifiedArbiter(address, networkId)) {
      return <IconButton tooltip='Verified!'><DoneIcon color={greenA200}/></IconButton>
    }
    return <IconButton tooltip='Not verified!'><WarningIcon color={red500}/></IconButton>
  }
  // TODO: This is bad practice, this should return something agnostic to react models
  static arbiters(networkId) {
    if (networkId === null) return [ <MenuItem primaryText=''/> ]

    return _.reduce(ArbitersJson, (ourArbiters, networks, name) => {
      const imgURL = EthereumBlockies.create({
        seed:networks[networkId].address.toLowerCase(),
        spotcolor: -1,
        size: 8,
        scale: 4,
      }).toDataURL();
      ourArbiters.push({
          key: (
            <MenuItem
              primaryText={name}
              leftIcon={<img src={"data:image/jpeg;" + imgURL} />}
              secondaryText={this.setVerifiedIcon(networks[networkId].address, networkId)}
            />
          ),
          value: networks[networkId].address
      })
      return ourArbiters;
    }, []);
  }

  static getArbiterNameByAddress() {
    
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
    return (
      <div style={{marginLeft: 50}}>
        <Table selectable={false} height='300px'>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn colSpan='2'>Address</TableHeaderColumn>
                <TableHeaderColumn>Network Id</TableHeaderColumn>
                <TableHeaderColumn>Description</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {_.keys(ArbitersJson).map((arbiter, index1) => {
                return NETWORK_IDS.map((networkId, index2) => {
                  const imgURL = EthereumBlockies.create({
                  seed: ArbitersJson[arbiter][networkId].address.toLowerCase(),
                  spotcolor: -1,
                  size: 8,
                  scale: 4,
                }).toDataURL();
                return (
                  <TableRow key={`${index1}-${index2}`}>
                    <TableRowColumn>{ArbitersJson[arbiter].name}</TableRowColumn>
                    <TableRowColumn colSpan='2'>
                      <img src={"data:image/jpeg;" + imgURL} />
                      {ArbitersJson[arbiter][networkId].address}
                    </TableRowColumn>
                    <TableRowColumn>{networkId}</TableRowColumn>
                    <TableRowColumn style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                    {ArbitersJson[arbiter].description}
                    </TableRowColumn>
                  </TableRow>
                )
                });
              })}
            </TableBody>
          </Table>
        </div>
    );
  }
}

export default Arbiters;
