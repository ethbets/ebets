/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import BigNumber from 'bignumber.js';

let BETFIELDS = {
  betState: 0,
  isFeatured: false,
  team0Name: '',
  team1Name: '',
  team0BetSum: new BigNumber(0),
  team1BetSum: new BigNumber(0),
  betsToTeam0: {},
  betsToTeam1: {},
  ERC20BetsToTeam0: {},
  ERC20BetsToTeam1: {},
  ERC20Team0BetSum: {},
  ERC20Team1BetSum: {},
  //validERC20: [],
  timestampMatchBegin: new BigNumber(0),
  timestampMatchEnd: new BigNumber(0),
  timestampArbiterDeadline: new BigNumber(0),
  timestampSelfDestructDeadline: new BigNumber(0),
  TAX: new BigNumber(0)
};

export default BETFIELDS;
