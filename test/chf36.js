/**
 * Contains all Test regarding CHF36
 */
import expectThrow from "./helpers/expectThrow";


const Cash36 = artifacts.require("./Cash36.sol");
const Cash36Compliance = artifacts.require("./Cash36Compliance.sol");
const Token36 = artifacts.require("./Token36.sol");
const Token36Controller = artifacts.require("./Token36Controller.sol");

function format(value) {
    return value * 10e18;
}

function parse(value) {
    return value / 10e18;
}

contract('Create and Test CHF36', function (accounts) {

    var Cash36Instance;
    var Cash36ComplianceInstance;
    var CHF36Instance;
    var CHF36ControllerInstance;
    var blockNumber;

    before("...get invest36Instance.", async function () {
        Cash36Instance = await Cash36.deployed();
        Cash36ComplianceInstance = await Cash36Compliance.deployed();

        await Cash36Instance.createNewToken('CHF36 Token', 'CHF36', { from: accounts[ 0 ] });
        blockNumber = web3.eth.blockNumber;

        var tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36');
        CHF36Instance = await Token36.at(tokenAddress);

        var tokenControllerAddress = await CHF36Instance.controller();
        CHF36ControllerInstance = await Token36Controller.at(tokenControllerAddress);

        await Cash36ComplianceInstance.addExchange(accounts[ 0 ], tokenAddress);
    });

    it("...it should set the correct initialization block.", async function () {
        var initBlock = await CHF36Instance.getInitializationBlock({ from: accounts[ 0 ] });
        assert.equal(initBlock.toNumber(), blockNumber, "The init blocknumber was not correct.");
    });

    it("...it should mint 100 CHF36 and assign it to accounts[1].", async function () {
        await Cash36ComplianceInstance.addUser(accounts[ 1 ], { from: accounts[ 0 ] });

        await CHF36ControllerInstance.mint(accounts[ 1 ], format(100), { from: accounts[ 0 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "100", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(parse(totalSupply), "100", "The totalSupply was not correct.");
    });

    it("...it should not allow minting from another account.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(CHF36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
    });

    it("...it should not allow to burn 50 CHF36.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(CHF36ControllerInstance.burn(accounts[ 1 ], 50, { from: accounts[ 0 ] }));
    });

    it("...it should burn 50 CHF36 and remove it from accounts[1].", async function () {
        //await CHF36Instance.approve(CHF36ControllerInstance.address, 50, { form: accounts[ 1 ] });
        await CHF36Instance.burn(format(50), { from: accounts[ 1 ] });

        var newBalanceForFee = await CHF36Instance.balanceOf(accounts[ 0 ]);
        assert.equal(parse(newBalanceForFee), "0.75", "The balance of feeCollector was not correct.");

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "50", "The balance of account was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(parse(totalSupply), "50.75", "The totalSupply was not correct.");
    });

    it("...it should not allow burning from another account.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(CHF36ControllerInstance.burn(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
    });

    it("...it should not allow to transfer 25 CHF36 to accounts[2] not being KYCed.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await CHF36Instance.transfer(accounts[ 2 ], 25, { from: accounts[ 1 ] });
    });

    it("...it should allow to transfer 25 CHF36 to accounts[2].", async function () {
        await Cash36ComplianceInstance.addUser(accounts[ 2 ], { from: accounts[ 0 ] });

        await CHF36Instance.transfer(accounts[ 2 ], format(25), { from: accounts[ 1 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "25", "The balance was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(parse(newBalanceFor2), "25", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(parse(totalSupply), "50.75", "The totalSupply was not correct.");
    });

    it("...it should allow to transferFrom 5 CHF36 to accounts[2] as accounts[3].", async function () {
        var allowance = await CHF36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(allowance, "0", "The allowance was not correct.");

        await CHF36Instance.approve(accounts[ 3 ], format(5), { from: accounts[ 1 ] })

        allowance = await CHF36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(parse(allowance), "5", "The allowance was not correct.");

        await CHF36Instance.transferFrom(accounts[ 1 ], accounts[ 2 ], format(5), { from: accounts[ 3 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "20", "The balance was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(parse(newBalanceFor2), "30", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(parse(totalSupply), "50.75", "The totalSupply was not correct.");
    });

    it("...it should not allow to transfer if accounts[2] is on blacklist.", async function () {
        var enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await Cash36ComplianceInstance.blockUser(accounts[ 2 ], { from: accounts[ 0 ] });

        enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, false, "The user was not disabled.");

        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await CHF36Instance.transfer(accounts[ 1 ], 5, { from: accounts[ 2 ] });
        //assert.equal(result, false, "The result of transfer was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor2), "20", "The balance was not correct.");

        await Cash36ComplianceInstance.unblockUser(accounts[ 2 ], { from: accounts[ 0 ] });

        enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await CHF36Instance.transfer(accounts[ 1 ], format(5), { from: accounts[ 2 ] });

        var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor2After), "25", "The balance was not correct.");
    });
});