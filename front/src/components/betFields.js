import BigNumber from 'bignumber.js';

let BETFIELDS = {
  betState: '',
  isFeatured: false,
  team0Name: '',
  team1Name: '',
  category: '',
  team0BetSum: new BigNumber(0),
  team1BetSum: new BigNumber(0),
  betsToTeam0: {},
  betsToTeam1: {},
  timestampMatchBegin: 0,
  timestampMatchEnd: 0,
  timestampArbiterDeadline: 0,
};

export default BETFIELDS;