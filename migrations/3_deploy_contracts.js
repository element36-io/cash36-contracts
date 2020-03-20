var Cash36 = artifacts.require('./Cash36.sol')
var Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
var Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
var CHF36Controller = artifacts.require('./CHF36/CHF36Controller.sol')
var CHF36 = artifacts.require('./CHF36/CHF36.sol')
var EUR36Controller = artifacts.require('./EUR36/EUR36Controller.sol')
var EUR36 = artifacts.require('./EUR36/EUR36.sol')
var Cash36Company = artifacts.require('./Cash36Company.sol')
var Ping = artifacts.require('./Ping.sol')


module.exports = async (deployer, network, accounts) => {
  console.log(" network "+network);
  console.log(" accounts "+JSON.stringify(accounts));

  let cash36 = await Cash36.deployed()

  // Deploy CHF36
  await deployer.deploy(CHF36)
  await deployer.deploy(CHF36Controller, CHF36.address, Cash36Compliance.address, Cash36Exchanges.address)

  await cash36.registerToken('CHF36', CHF36.address)

  let chf36Controller = await CHF36Controller.deployed()
  await chf36Controller.transferOwnership(Cash36.address)

  let chf36 = await CHF36.deployed()
  await chf36.addPauser(CHF36Controller.address)
  await chf36.renouncePauser()
  await chf36.changeController(CHF36Controller.address)

  // Deploy EUR36
  await deployer.deploy(EUR36)
  await deployer.deploy(EUR36Controller, EUR36.address, Cash36Compliance.address, Cash36Exchanges.address)

  await cash36.registerToken('EUR36', EUR36.address)

  let eur36Controller = await EUR36Controller.deployed()
  await eur36Controller.transferOwnership(Cash36.address)

  let eur36 = await EUR36.deployed()
  await eur36.addPauser(EUR36Controller.address)
  await eur36.renouncePauser()
  await eur36.changeController(EUR36Controller.address)

  let cash36Compliance = await Cash36Compliance.deployed()
  let cash36Exchange = await Cash36Exchanges.deployed()


  // Deploy element36 as Company on Blockchain and whitelist
  await deployer.deploy(Cash36Company, 'element36 AG')
  let element36Company = await Cash36Company.deployed()
  await cash36Compliance.addCompany(Cash36Company.address)

  await deployer.deploy(Ping, CHF36.address)
  
  
}
