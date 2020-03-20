var Migrations = artifacts.require("./migrations/Migrations.sol");

module.exports = function(deployer,network) {
  console.log(" network_id "+network)
  deployer.deploy(Migrations);
  
};
