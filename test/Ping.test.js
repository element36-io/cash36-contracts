/**
 * Contains all Test specific for CHF36
 */
const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers')

const Cash36 = artifacts.require('./Cash36.sol')
const Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
const Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
const Cash36Company = artifacts.require('./Cash36Company.sol')
const Token36 = artifacts.require('./Token36.sol')
const CHF36Controller = artifacts.require('./CHF36Controller.sol')
const EUR36Controller = artifacts.require('./EUR36Controller.sol')

const Ping = artifacts.require('./Ping.sol')


function format (value) {
  //return value;
  return value * 10e18
}

function parse (value) {
  //return value;
  return value / 10e18
}

contract('Create and Test Token36', function (accounts) {

  var Cash36Instance
  var Cash36ComplianceInstance
  var Cash36ExchangesInstance

  var CHF36Instance
  var CHF36ControllerInstance

  var EUR36Instance
  var EUR36ControllerInstance

  var element36Company

  var exchangeAddress
  var complianceAddress

  var pingInstance

  before('...Setup Cash36Instance and Ping', async function () {
    Cash36Instance = await Cash36.deployed()
    Cash36ComplianceInstance = await Cash36Compliance.deployed()
    Cash36ExchangesInstance = await Cash36Exchanges.deployed()

    const tokenAddressCHF = await Cash36Instance.getTokenBySymbol('CHF36')
    CHF36Instance = await Token36.at(tokenAddressCHF)

    //const tokenAddressEUR = await Cash36Instance.getTokenBySymbol('EUR36')
    //EUR36Instance = await Token36.at(tokenAddressEUR)

    const tokenControllerAddressCHF = await CHF36Instance.controller()
    CHF36ControllerInstance = await CHF36Controller.at(tokenControllerAddressCHF)

    //const tokenControllerAddressEUR = await EUR36Instance.controller()
    //EUR36ControllerInstance = await EUR36Controller.at(tokenControllerAddressEUR)

    exchangeAddress = accounts[0]
    complianceAddress = accounts[0]

    await Cash36ExchangesInstance.addExchange(exchangeAddress, tokenAddressCHF)
    //await Cash36ExchangesInstance.addExchange(exchangeAddress, tokenAddressEUR)
    pingInstance = await Ping.deployed()
  })

  

  it('...it should add accounts[1] as user we initial rights.', async function () {
    await Cash36ComplianceInstance.addUser(accounts[1], {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1], web3.utils.fromAscii("ATTR_SELL"), 1, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1], web3.utils.fromAscii("ATTR_SEND"), 1, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1], web3.utils.fromAscii("ATTR_RECEIVE"), 1, {from: accounts[0]})

    var checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[1], {from: accounts[0]})
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.')

    var checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], web3.utils.fromAscii('ATTR_SELL'), {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1Attr was not correct.')
  })

  it('...it should add accounts[2] as user we initial rights.', async function () {
    await Cash36ComplianceInstance.addUser(accounts[2], {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], web3.utils.fromAscii("ATTR_SELL"), 1, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], web3.utils.fromAscii("ATTR_SEND"), 1, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], web3.utils.fromAscii("ATTR_RECEIVE"), 1, {from: accounts[0]})

    var checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[2], {from: accounts[0]})
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.')

    var checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[2], web3.utils.fromAscii('ATTR_SELL'), {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1Attr was not correct.')
    await testBalance(0,0,0,0)
  })


  it('...it should mint 200 CHF36 and assign it to accounts[1].', async function () {
    await CHF36ControllerInstance.mint(accounts[1], 20, {from: exchangeAddress})
    await testBalance(20,0,0,20)
  })

  it('...it should send 2x25 chf from accounts[1] and exchange to Ping.', async function () {
    await CHF36Instance.transfer(accounts[2], 2, {from: accounts[1]})
    await CHF36Instance.transfer(pingInstance.address, 2, {from: accounts[1]})
    await testBalance(16,2,2,20)
    await CHF36ControllerInstance.mint(pingInstance.address, 10, {from: exchangeAddress})
    await testBalance(16,2,12,30)
  })

  it ("...it should steal funds from ping contract", async function () {
    // can not be stolen by account 3, bause it is not KYC-ed
    await expectRevert.unspecified(pingInstance.steal({from: accounts[3]}))

    // can be stolen by account 2
    await pingInstance.steal({from: accounts[1]})
    await testBalance(28,2,0,30)
  })

  it ("...it should give more funds to ping - requires approval; and get it back with pong ", async function () {
    
    await CHF36Instance.approve(pingInstance.address, 2,{from: accounts[1]})
    //             1:28 2:2 ping:0   total:30
    await pingInstance.ping(accounts[2], 2,{from: accounts[1]})
    //2:a1-->ping  1:26 2:2 ping:2 total:30
    await testBalance(26,2,2,30)

    var bene=await pingInstance.beneficiary();
    assert.equal(bene,accounts[2])
    
    await pingInstance.pong({from: accounts[2]})
    //2:ping-->a2  a1:26 a2:4 ping:0 total:30
 
    bene=await pingInstance.beneficiary();
    assert.equal(bene,0)
   
    await testBalance(26,4,0,30)
  })

  it ("...it should do a wallet-free ping transaction ", async function () {
    // in case of payment, mint comes from the exchange
    // ping
    var txData=await CHF36ControllerInstance.mint(pingInstance.address, 7, {from: exchangeAddress})
    await testBalance(26,4,7,37) 
    //pong - transaciton hash of minting will be taken as a clue to idetify receipient of SEPA transaction
    var tx=await pingInstance.pongWalletFree(txData.tx,5,{from:exchangeAddress});
    await testBalance(26,4,2,32);
   
  })

  async function testBalance( a1,  a2, ping, total) {
    console.log("      > test balances - ping:"+ping+" a1:"+a1+" a2:"+a2+" total:"+total)
    if ( (ping+a1+a2)!=total )  throw "wrong total in params"

    var b = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(b, a1, 'The balance a1 was not correct.')
    b = await CHF36Instance.balanceOf(accounts[2])
    assert.equal(b, a2, 'The balance a2 was not correct.')
    b = await CHF36Instance.balanceOf(pingInstance.address)
    assert.equal(b, ping, 'The balance ping was not correct.')

    b = await CHF36Instance.totalSupply()
    assert.equal(b, total, 'The totalSupply was not correct.')
  }
})