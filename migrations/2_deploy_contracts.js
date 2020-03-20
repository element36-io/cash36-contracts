var Cash36 = artifacts.require('./Cash36.sol')
var Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
var Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')

module.exports = async (deployer, network, accounts) => {
  console.log(" network "+network);
  console.log(" accounts "+JSON.stringify(accounts));
  
  await deployer.deploy(Cash36Compliance)
  await deployer.deploy(Cash36Exchanges)
  await deployer.deploy(Cash36)

  
}
