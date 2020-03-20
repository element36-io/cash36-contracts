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
  } else if (network.includes("main")) {
    console.log(" setting fixes wallets for main network "+network)
    walletOfTheExchange='0xC8Ab38aCd8c4c7A53a431a5791B4898e105e3cd9' // cash36-exchange/src/main/ressources/exchange.prod.json
    walletOfComplianceServer='0x50fbc244494bEBbcff285447B737871994321077'; // cash36-compliance/src/main/ressources/compliance.prod.json
    ownerAccount= '0x56788E08C97d2677DAdED801e69bfE5D33ddACD5';
  } else {
    console.log("taking default values for network "+network)
  }


  let cash36Exchange = await Cash36Exchanges.deployed()
  await cash36Exchange.addExchange(walletOfTheExchange, CHF36.address)
  await cash36Exchange.addExchange(walletOfTheExchange, EUR36.address)
  await cash36Exchange.transferOwnership(ownerAccount)

  let cash36Compliance = await Cash36Compliance.deployed()
  await cash36Compliance.changeOfficer(walletOfComplianceServer)  
  let cash36 = await Cash36.deployed()
  await cash36.transferOwnership(ownerAccount)

  let element36Company = await Cash36Company.deployed()
  await element36Company.addOwner(ownerAccount)

  // postprocessing for local network for convinience
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



