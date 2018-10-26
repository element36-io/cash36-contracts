var Cash36 = artifacts.require('./Cash36.sol')
var Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
var CHF36Controller = artifacts.require('./CHF36/CHF36Controller.sol')
var CHF36 = artifacts.require('./CHF36/CHF36.sol')
var EUR36Controller = artifacts.require('./EUR36/EUR36Controller.sol')
var EUR36 = artifacts.require('./EUR36/EUR36.sol')
var GBP36Controller = artifacts.require('./GBP36/GBP36Controller.sol')
var GBP36 = artifacts.require('./GBP36/GBP36.sol')
var USD36Controller = artifacts.require('./USD36/USD36Controller.sol')
var USD36 = artifacts.require('./USD36/USD36.sol')

module.exports = function (deployer, network) {
  deployer.then(async () => {
    await deployer.deploy(Cash36Compliance)
    await deployer.deploy(Cash36)

    let cash36 = await Cash36.deployed()

    // Deploy CHF36
    await deployer.deploy(CHF36)
    await deployer.deploy(CHF36Controller, CHF36.address, Cash36Compliance.address)

    cash36.registerToken('CHF36', CHF36.address)

    let chf36Controller = await CHF36Controller.deployed()
    chf36Controller.transferOwnership(Cash36.address)

    let chf36 = await CHF36.deployed()
    chf36.changeController(CHF36Controller.address)

    // Deploy EUR36
    await deployer.deploy(EUR36)
    await deployer.deploy(EUR36Controller, EUR36.address, Cash36Compliance.address)

    cash36.registerToken('EUR36', EUR36.address)

    let eur36Controller = await EUR36Controller.deployed()
    eur36Controller.transferOwnership(Cash36.address)

    let eur36 = await EUR36.deployed()
    eur36.changeController(EUR36Controller.address)

    // Deploy GBP36
    await deployer.deploy(GBP36)
    await deployer.deploy(GBP36Controller, GBP36.address, Cash36Compliance.address)

    cash36.registerToken('GBP36', GBP36.address)

    let gbp36Controller = await GBP36Controller.deployed()
    gbp36Controller.transferOwnership(Cash36.address)

    let gbp36 = await GBP36.deployed()
    gbp36.changeController(GBP36Controller.address)

    // Deploy USD36
    await deployer.deploy(USD36)
    await deployer.deploy(USD36Controller, USD36.address, Cash36Compliance.address)

    cash36.registerToken('USD36', USD36.address)

    let usd36Controller = await USD36Controller.deployed()
    usd36Controller.transferOwnership(Cash36.address)

    let usd36 = await USD36.deployed()
    usd36.changeController(USD36Controller.address)

    let cash36Compliance = await Cash36Compliance.deployed()

    if (network == "test") {
      await cash36Compliance.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', CHF36.address)
      await cash36Compliance.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', EUR36.address)
      await cash36Compliance.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', USD36.address)
      await cash36Compliance.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', GBP36.address)

      // Add Maik uPort Account
      await cash36Compliance.addUser('0x9557fd8fd9010b8abe7b57847f3ccf800062ac04');

      // Add Walter uPort Account
      //await cash36Compliance.addUser('0x');

      // Add Demo users
      await cash36Compliance.addUser('0x0000000000000000000000000000000000000001');
      await cash36Compliance.addUser('0x0000000000000000000000000000000000000002');
      await cash36Compliance.addUser('0x0000000000000000000000000000000000000004');

      await cash36Compliance.changeOfficer('0xcd0dd78b1a09f860f39218d1124e121bf52d71a9')
    }
  })
}
