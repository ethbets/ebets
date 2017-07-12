var Helper = artifacts.require("./helpers.sol");
var Ebets = artifacts.require("./ebets.sol");

module.exports = function(deployer) {
  deployer.link(Helper, [Ebets]);
  deployer.deploy(Ebets);
};
