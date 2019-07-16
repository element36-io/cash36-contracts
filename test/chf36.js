/**
 * Contains all Test specific for CHF36
 */
const Cash36 = artifacts.require('./Cash36.sol')
const Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
const Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
const Token36 = artifacts.require('./Token36.sol')
const Token36Controller = artifacts.require('./CHF36Controller.sol')

function format (value) {
  //return value;
  return value * 10e18
}

function parse (value) {
  //return value;
  return value / 10e18
}

contract('Create and Test CHF36', function (accounts) {

  var Cash36Instance
  var Cash36ComplianceInstance
  var Cash36ExchangesInstance
  var CHF36Instance
  var CHF36ControllerInstance

  var exchangeAddress

  before('...get Cash36Instance.', async function () {
    Cash36Instance = await Cash36.deployed()
    Cash36ComplianceInstance = await Cash36Compliance.deployed()
    Cash36ExchangesInstance = await Cash36Exchanges.deployed()

    var tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    CHF36Instance = await Token36.at(tokenAddress)

    var tokenControllerAddress = await CHF36Instance.controller()
    CHF36ControllerInstance = await Token36Controller.at(tokenControllerAddress)

    exchangeAddress = accounts[0]
    await Cash36ExchangesInstance.addExchange(exchangeAddress, tokenAddress)
  })

  it('...it should allow to administrate cash36 contracts.', async function () {
    var compliance = await Cash36Instance.getCompliance('CHF36')
    assert.equal(compliance, Cash36Compliance.address, 'The compliance address was not correct.')

    var exchanges = await Cash36Instance.getExchangesContract('CHF36')
    assert.equal(exchanges, Cash36Exchanges.address, 'The exchanges address was not correct.')
  })

  it('...it should mint 100 CHF36 and assign it to accounts[1].', async function () {
    await Cash36ComplianceInstance.addUser(accounts[1], {from: accounts[0]})
    await CHF36ControllerInstance.mint(accounts[1], accounts[1], 200, {from: accounts[0]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '200', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '200', 'The totalSupply was not correct.')

    var checkUser1 = await Cash36ComplianceInstance.checkUser(accounts[1], { from: accounts[0]})
    assert.equal(checkUser1, true, 'The checkUser1 was not correct.')

    var checkUser1Attr = await Cash36ComplianceInstance.hasAttribute(accounts[1], web3.utils.fromAscii("ATTR_SELL"), { from: accounts[0] })
    assert.equal(checkUser1Attr, true, 'The checkUser1Attr was not correct.')
  })

  it('...it should not allow minting from another account.', async function () {
    // TODO: figure out how to test throws in JS, otherwise write Sol Tests
    //await expectThrow(CHF36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
  })

  it('...it should not allow to burn 50 CHF36.', async function () {
    // TODO: figure out how to test throws in JS, otherwise write Sol Tests
    //await expectThrow(CHF36ControllerInstance.burn(accounts[ 1 ], 50, { from: accounts[ 0 ] }));
  })

  it('...it should burn 50 CHF36 and remove it from accounts[1].', async function () {
    await CHF36Instance.burn(50, { from: accounts[1] })

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '150', 'The balance of account was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '150', 'The totalSupply was not correct.')
  })

  it('...it should burnForm 25 CHF36 and remove it from accounts[1].', async function () {
    await CHF36ControllerInstance.burn(accounts[1], 25, { from: exchangeAddress })

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '125', 'The balance of account was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '125', 'The totalSupply was not correct.')
  })

  it('...it should not allow burning from another account.', async function () {
    // TODO: figure out how to test throws in JS, otherwise write Sol Tests
    //await expectThrow(CHF36ControllerInstance.burn(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
  })

  it('...it should not allow to transfer 25 CHF36 to accounts[2] not being KYCed.', async function () {
    // TODO: figure out how to test throws in JS, otherwise write Sol Tests
    //await CHF36Instance.transfer(accounts[ 2 ], 25, { from: accounts[ 1 ] });
  })

  it('...it should allow to transfer 25 CHF36 to accounts[2].', async function () {
    await Cash36ComplianceInstance.addUser(accounts[2], {from: accounts[0]})

    await CHF36Instance.transfer(accounts[2], 25, {from: accounts[1]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '100', 'The balance was not correct.')

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[2])
    assert.equal(newBalanceFor2, '25', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '125', 'The totalSupply was not correct.')
  })

  it('...it should allow to transferFrom 5 CHF36 to accounts[2] as accounts[3].', async function () {
    var allowance = await CHF36Instance.allowance(accounts[1], accounts[3])
    assert.equal(allowance, '0', 'The allowance was not correct.')

    await CHF36Instance.approve(accounts[3], 5, {from: accounts[1]})

    allowance = await CHF36Instance.allowance(accounts[1], accounts[3])
    assert.equal(allowance, '5', 'The allowance was not correct.')

    await CHF36Instance.transferFrom(accounts[1], accounts[2], 5, {from: accounts[3]})

    var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor1, '95', 'The balance was not correct.')

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[2])
    assert.equal(newBalanceFor2, '30', 'The balance was not correct.')

    var totalSupply = await CHF36Instance.totalSupply()
    assert.equal(totalSupply, '125', 'The totalSupply was not correct.')
  })

  it('...it should not allow to transfer if accounts[2] is on blacklist.', async function () {
    var enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, true, 'The user was not enabled.')

    await Cash36ComplianceInstance.blockUser(accounts[2], {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, false, 'The user was not disabled.')

    // TODO: figure out how to test throws in JS, otherwise write Sol Tests
    //await CHF36Instance.transfer(accounts[ 1 ], 5, { from: accounts[ 2 ] });
    //assert.equal(result, false, "The result of transfer was not correct.");

    var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2, '95', 'The balance was not correct.')

    await Cash36ComplianceInstance.unblockUser(accounts[2], {from: accounts[0]})

    enabled = await Cash36ComplianceInstance.checkUser(accounts[2])
    assert.equal(enabled, true, 'The user was not enabled.')

    await CHF36Instance.transfer(accounts[1], 5, {from: accounts[2]})

    var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[1])
    assert.equal(newBalanceFor2After, '100', 'The balance was not correct.')
  })
})