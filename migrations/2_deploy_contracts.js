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
  let element36Company = await Cash36Company.deployed()
  await cash36Compliance.addCompany(Cash36Company.address)

  await deployer.deploy(Ping, CHF36.address)
  
  // fixed wallet addresses for testnetworks
  let walletOfTheExchange='0x5c84e251671f94b5de719106fb34a1e99828d15d' // cash36-exchange/src/main/ressources/exchange.json
  let walletOfComplianceServer='0xcd0dd78b1a09f860f39218d1124e121bf52d71a9'; // cash36-compliance/src/main/ressources/compliance.json
  let ownerAccount= walletOfTheExchange; // First account of HD Wallet used to deploy the contracts

  console.log("network: "+network)
  if (network == 'local') {
    console.log(" setting values for local network "+network)
    walletOfTheExchange= accounts[3] 
    walletOfComplianceServer= accounts[0] 
    ownerAccount=  accounts[0] 
  } else if (network == 'main') {
    console.log(" setting fixes wallets for main network "+network)
    walletOfTheExchange='0xC8Ab38aCd8c4c7A53a431a5791B4898e105e3cd9' // cash36-exchange/src/main/ressources/exchange.prod.json
    walletOfComplianceServer='0x50fbc244494bEBbcff285447B737871994321077'; // cash36-compliance/src/main/ressources/compliance.prod.json
    ownerAccount= '0x56788E08C97d2677DAdED801e69bfE5D33ddACD5';
  } else {
    console.log("taking default values for network "+network)
  }

  await cash36Exchange.addExchange(walletOfTheExchange, CHF36.address)
  await cash36Exchange.addExchange(walletOfTheExchange, EUR36.address)
  await cash36Exchange.transferOwnership(ownerAccount)
  await cash36Compliance.changeOfficer(walletOfComplianceServer)  
  await cash36.transferOwnership(ownerAccount)
  await element36Company.addOwner(ownerAccount)


  if (network== 'local') {
    console.log(" .... doing stuff for local network "+network)
    await web3.eth.sendTransaction({
      to: walletOfTheExchange,
      from: accounts[0],
      value: web3.utils.toWei('3', 'ether')
    })
    await web3.eth.sendTransaction({
      to: walletOfComplianceServer,
      from: accounts[0],
      value: web3.utils.toWei('3', 'ether')
    })
    await web3.eth.sendTransaction({
      to: ownerAccount,
      from: accounts[0],
      value: web3.utils.toWei('3', 'ether')
    })
  }
}
