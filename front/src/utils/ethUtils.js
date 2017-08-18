/* Copyright (C) 2017 ethbets
 * All rights reserved.
 * 
 * This software may be modified and distributed under the terms
 * of the BSD license. See the LICENSE file for details.
*/

import BigNumber from 'bignumber.js';

export function formatEth(inWei) {
  return inWei.dividedBy(oneEthInWei()).toFormat(18);
}

export function oneEthInWei() {
  return new BigNumber('1000000000000000000');
}

export function formatToken(value) {
  return value.toFormat(18);
}

