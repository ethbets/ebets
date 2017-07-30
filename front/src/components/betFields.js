import BigNumber from 'bignumber.js';

let BETFIELDS = {
  betState: 0,
  isFeatured: false,
  team0Name: '',
  team1Name: '',
  category: '',
  team0BetSum: new BigNumber(0),
  team1BetSum: new BigNumber(0),
  betsToTeam0: {},
  betsToTeam1: {},
  timestampMatchBegin: new BigNumber(0),
  timestampMatchEnd: new BigNumber(0),
  timestampArbiterDeadline: new BigNumber(0),
  timestampSelfDestructDeadline: new BigNumber(0),
  TAX: new BigNumber(0)
};

export default BETFIELDS;