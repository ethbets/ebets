var Monarchy = artifacts.require('./monarchy.sol');
var Triunvirate = artifacts.require('./triunvirate.sol');

module.exports = function(deployer) {
  deployer.deploy(Monarchy, 'Monarchy');
  //deployer.deploy(Triunvirate);
};
