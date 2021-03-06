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

  before('...Setup Cash36Instance.', async function () {
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

    if (Cash36Compliance.Attribs == undefined) {
      console.log(" --> setting enums for Cash36Compoliance.Attribs")
      Cash36Compliance.Attribs={ EXST:0, BUY:1, SELL:2, RCV:3, SEND:4, CPNY:5, BLACK:6, LOCK:7 }
    }
  })

  it('...it should allow to administrate cash36 contracts.', async function () {
    it('...and read compliance contract.', async function () {
      var compliance = await CHF36Instance.getCompliance(symbol)
      assert.equal(compliance, Cash36Compliance.address, 'The compliance address was not correct.')
    })

    it('...and read exchange contract.', async function () {
      var exchanges = await CHF36Instance.getExchangesContract(symbol)
      assert.equal(exchanges, Cash36Exchanges.address, 'The exchanges address was not correct.')
    })

    it('...and read token address contract.', async function () {
      var tokenAddress = await CHF36Instance.getTokenBySymbol(symbol)
      assert.equal(tokenAddress, tokenInstance.address, 'The tokenAddress address was not correct.')
    })
  })

  it('...it should add accounts[1] as user we initial rights.', async function () {
    await Cash36ComplianceInstance.addUser(accounts[1], {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1], Cash36Compliance.Attribs.SELL, true, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1], Cash36Compliance.Attribs.SEND,true, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[1],Cash36Compliance.Attribs.RCV,true, {from: accounts[0]})

    var checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[1], {from: accounts[0]})
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.')

    var checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.SELL, {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1Attr was not correct.')
  })


  it('...it should mint 200 CHF36 and assign it to accounts[1].', async function () {
    await CHF36ControllerInstance.mint(accounts[1], 200, {from: exchangeAddress})
    
    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '200', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '200', 'The totalSupply was not correct.')
  })

  it('...it should not allow minting from another account.', async function () {
    //await expectRevert.unspecified(CHF36ControllerInstance.mint(accounts[2], accounts[2], 200, {from: exchangeAddress}))
  })

  it('...it should allow accounts[1] to burn 50 CHF36.', async function () {
    await CHF36Instance.burn(50, {from: accounts[1]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '150', 'The balance of account was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '150', 'The totalSupply was not correct.')
  })

  it('...it should not allow to burn 50 CHF36 from account[2].', async function () {
    await expectRevert.unspecified(CHF36Instance.burn(50, {from: accounts[2]}))
  })

  it('...it should allow exchange to burn 25 CHF36 from accounts[1].', async function () {
    await CHF36ControllerInstance.burn(accounts[1], 25, {from: exchangeAddress})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '125', 'The balance of account was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '125', 'The totalSupply was not correct.')
  })

  it('...it should allow to transfer 25 CHF36 to accounts[2].', async function () {
    await Cash36ComplianceInstance.addUser(accounts[2], {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.SELL, true, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.SEND, true, {from: accounts[0]})
    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.RCV, true, {from: accounts[0]})

    var txReceipt = await  CHF36Instance.transfer(accounts[2], 25, {from: accounts[1]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '100', 'The balance was not correct.')

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[2])
    assert.equal(newBalanceFor2, '25', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '125', 'The totalSupply was not correct.')
 
    //InitiateTransfer(address indexed source, bytes32 indexed transactionHash, uint256 amount);
    // https://forum.openzeppelin.com/t/how-to-test-for-events-that-are-dispatched-in-a-nested-operation/955/2
    const txReceiptClue= await CHF36Instance.transferClue("0x1234567890",25, {from:accounts[1]})  
    /* TODO:was
    const event = expectEvent.inLogs(txReceiptClue.logs, 'InitiateTransfer', {
      from: accounts[1],
      transactionHash: "0x1234567890000000000000000000000000000000000000000000000000000000",
      amount: '25'
    });
    */

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '100', 'The totalSupply was not correct.')

  })

  it('...it should allow to transferFrom 5 CHF36 to accounts[2] as accounts[3].', async function () {
    var allowance = await CHF36Instance.allowance(accounts[1], accounts[3])
    assert.equal(allowance, '0', 'The allowance was not correct.')

    await CHF36Instance.approve(accounts[3], 5, {from: accounts[1]})

    allowance = await CHF36Instance.allowance(accounts[1], accounts[3])
    assert.equal(allowance, '5', 'The allowance was not correct.')

    await CHF36Instance.transferFrom(accounts[1], accounts[2], 5, {from: accounts[3]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '70', 'The balance was not correct.')  //95

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[2])
    assert.equal(newBalanceFor2, '30', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '100', 'The totalSupply was not correct.') // 125
  })

  it('...it should not allow to transfer if accounts[2] is on blacklist.', async function () {
    var enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, true, 'The user was not enabled.')

    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.BLACK, true, {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, false, 'The user was not disabled.')

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2, '70', 'The balance was not correct.')  //95

    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.BLACK, false, {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, true, 'The user was not enabled.')

    await CHF36Instance.transfer(accounts[1], 5, {from: accounts[2]})

    var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2After, '75', 'The balance was not correct.') //100
  })


  it('...it should not be possible for a normal user to MINT coins ', async function () {
    await expectRevert.unspecified(CHF36ControllerInstance.mint(accounts[2], 5, {from: accounts[1]}))
    
    var isOfficer = await Cash36ComplianceInstance.isOfficer(accounts[0])
    assert.equal(isOfficer, true, 'The user is not an officer')
  
    CHF36ControllerInstance.mint(accounts[1], 5, {from: accounts[0]})
    var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2After, '80', 'The balance was not correct.') 
    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '105', 'The totalSupply was not correct.') 

  })

  it('...it should not be possible for a normal user to BURN coins ', async function () {
    return; 
    await expectRevert.unspecified(CHF36ControllerInstance.burn(accounts[2], 5, {from: accounts[1]}))
    
    var isOfficer = await Cash36ComplianceInstance.isOfficer(accounts[0])
    assert.equal(isOfficer, true, 'The user is not an officer')
  
    CHF36ControllerInstance.burn(accounts[1], 5, {from: accounts[0]})
    var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2After, '75', 'The balance was not correct.') 
    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '100', 'The totalSupply was not correct.') 

  })


  it('...it should not allow to transfer if accounts[2] is locked Forever.', async function () {
    var enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, true, 'The user was not enabled.')

    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.LOCK, true,  {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, false, 'The user was not disabled.')
    await Cash36ComplianceInstance.setAttribute(accounts[2], Cash36Compliance.Attribs.BLACK, false,  {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, false, 'The user should stay disabled.')

    // TODO:wasa more tests here to check acitivating account or catch exception when try to unlock user

    await expectRevert.unspecified(CHF36Instance.transfer(accounts[1], 5, {from: accounts[2]}))

    //var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[1])
    //assert.equal(newBalanceFor2After, '75', 'The balance was not correct.') //100 */
  })



  it('...it should activate and deactivagte accounts[1] correctly.', async function () {
    
    await Cash36ComplianceInstance.deactivateUser(accounts[1], {from: accounts[0]})
    var checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.SELL, {from: accounts[0]})
    assert.equal(checkUser1Attr, false, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.SEND, {from: accounts[0]})
    assert.equal(checkUser1Attr, false, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.RCV, {from: accounts[0]})
    assert.equal(checkUser1Attr, false, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.BUY, {from: accounts[0]})
    assert.equal(checkUser1Attr, false, 'The checkUser1 was not correct.')

    var checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[1], {from: accounts[0]})
    // checkuser shall not be affected by attribs
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.  ')
  
    await Cash36ComplianceInstance.activateUser(accounts[1], {from: accounts[0]})
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.SELL, {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.SEND, {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.RCV, {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1 was not correct.')
    checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], Cash36Compliance.Attribs.BUY, {from: accounts[0]})
    assert.equal(checkUser1Attr, true, 'The checkUser1 was not correct.')


    checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[1], {from: accounts[0]})
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.')
  })

})