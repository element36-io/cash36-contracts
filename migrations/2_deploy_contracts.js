var Cash36 = artifacts.require('./Cash36.sol')
var Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
var Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
var CHF36Controller = artifacts.require('./CHF36/CHF36Controller.sol')
var CHF36 = artifacts.require('./CHF36/CHF36.sol')
var EUR36Controller = artifacts.require('./EUR36/EUR36Controller.sol')
var EUR36 = artifacts.require('./EUR36/EUR36.sol')
var Cash36Company = artifacts.require('./Cash36Company.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Cash36Compliance)
  await deployer.deploy(Cash36Exchanges)
  await deployer.deploy(Cash36)

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
  await cash36Compliance.addCompany(Cash36Company.address)

  if (network == 'local') {
    await cash36Exchange.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', CHF36.address)
    await cash36Exchange.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', EUR36.address)
    await cash36Exchange.transferOwnership('0x9bed0471bd661a394793d4a9b11064da30b20ce5')

    await cash36Compliance.changeOfficer('0xcd0dd78b1a09f860f39218d1124e121bf52d71a9')
    await cash36.transferOwnership('0x9bed0471bd661a394793d4a9b11064da30b20ce5')

    // Current Owner Compliance Contract
    let element36Company = await Cash36Company.deployed()
    await element36Company.addOwner('0xcd0dd78b1a09f860f39218d1124e121bf52d71a9')
    
    await web3.eth.sendTransaction({
      to: '0x5c84e251671f94b5de719106fb34a1e99828d15d',
      from: accounts[0],
      value: web3.utils.toWei('25', 'ether')
    })
    await web3.eth.sendTransaction({
      to: '0xcd0dd78b1a09f860f39218d1124e121bf52d71a9',
      from: accounts[0],
      value: web3.utils.toWei('25', 'ether')
    })
    await web3.eth.sendTransaction({
      to: '0x9bed0471bd661a394793d4a9b11064da30b20ce5',
      from: accounts[0],
      value: web3.utils.toWei('25', 'ether')
    })
  } else if (network == 'test') {
    await cash36Exchange.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', CHF36.address)
    await cash36Exchange.addExchange('0x5c84e251671f94b5de719106fb34a1e99828d15d', EUR36.address)

    await cash36Compliance.changeOfficer('0xcd0dd78b1a09f860f39218d1124e121bf52d71a9')

    // Current Owner Compliance Contract
    let element36Company = await Cash36Company.deployed()
    await element36Company.addOwner('0xcd0dd78b1a09f860f39218d1124e121bf52d71a9')
  } else if (network == 'main') {
    await cash36Exchange.addExchange('0x5cf43737ccc03cfcb5af9841eaeb299f21f20003', CHF36.address)
    await cash36Exchange.addExchange('0x5cf43737ccc03cfcb5af9841eaeb299f21f20003', EUR36.address)

    await cash36Compliance.changeOfficer('0x502aac877a292c1f4b9c7f55359e72ff21f90002')

    // Current Owner Compliance Contract
    let element36Company = await Cash36Company.deployed()
    await element36Company.addOwner('0x502aac877a292c1f4b9c7f55359e72ff21f90002')
  }
}
