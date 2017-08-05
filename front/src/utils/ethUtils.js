import BigNumber from 'bignumber.js';

export function formatEth(inWei) {
    return inWei.dividedBy(oneEthInWei()).toFormat(18);
}

export function oneEthInWei() {
  return new BigNumber('1000000000000000000');
}