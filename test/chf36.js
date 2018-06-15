/**
 * Contains all Test regarding CHF36
 */
import expectThrow from "./helpers/expectThrow";


const Cash36 = artifacts.require("./Cash36.sol");
const Cash36KYC = artifacts.require("./Cash36KYC.sol");
const Token36 = artifacts.require("./Token36.sol");
const Token36Controller = artifacts.require("./Token36Controller.sol");
const EthereumClaimsRegistry = artifacts.require("./lib/uport/EthereumClaimsRegistry.sol");

contract('Create and Test CHF36', function (accounts) {

    var Cash36Instance;
    var Cash36KYCInstance;
    var CHF36Instance;
    var CHF36ControllerInstance;
    var RegistryInstance;
    var blockNumber;

    before("...get invest36Instance.", async function () {
        Cash36Instance = await Cash36.deployed();
        Cash36KYCInstance = await Cash36KYC.deployed();
        RegistryInstance = await EthereumClaimsRegistry.deployed();

        await Cash36Instance.addExchange(accounts[ 0 ]);

        await Cash36Instance.createNewToken('CHF36 Token', 'CHF36', { from: accounts[ 0 ] });
        blockNumber = web3.eth.blockNumber;

        var tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36');
        CHF36Instance = await Token36.at(tokenAddress);

        var tokenControllerAddress = await Cash36Instance.getTokenController(tokenAddress);
        CHF36ControllerInstance = await Token36Controller.at(tokenControllerAddress);
    });

    it("...it should set the correct initialization block.", async function () {
        var initBlock = await CHF36Instance.getInitializationBlock({ from: accounts[ 0 ] });
        assert.equal(initBlock.toNumber(), blockNumber, "The init blocknumber was not correct.");
    });

    it("...it should mint 100 CHF36 and assign it to accounts[1].", async function () {
        await RegistryInstance.setClaim(accounts[ 1 ], 'cash36KYC', 'verified', { from: accounts[ 2 ] });

        await CHF36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 0 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor1, "100", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(totalSupply, "100", "The totalSupply was not correct.");

        var tokenHolders = await CHF36ControllerInstance.allHolders();
        assert.equal(tokenHolders.length, 1, "The tokenHolders were not correct.");
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
        await CHF36ControllerInstance.burn(accounts[ 1 ], 50, { from: accounts[ 0 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor1, "50", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(totalSupply, "50", "The totalSupply was not correct.");
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
        await RegistryInstance.setClaim(accounts[ 2 ], 'cash36KYC', 'verified', { from: accounts[ 2 ] });

        await CHF36Instance.transfer(accounts[ 2 ], 25, { from: accounts[ 1 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor1, "25", "The balance was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(newBalanceFor2, "25", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(totalSupply, "50", "The totalSupply was not correct.");

        var tokenHolders = await CHF36ControllerInstance.allHolders();
        assert.equal(tokenHolders.length, 2, "The tokenHolders were not correct.");
    });

    it("...it should allow to transferFrom 5 CHF36 to accounts[2] as accounts[3].", async function () {
        var allowance = await CHF36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(allowance, "0", "The allowance was not correct.");

        await CHF36Instance.approve(accounts[ 3 ], 5, { from: accounts[ 1 ] })

        allowance = await CHF36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(allowance, "5", "The allowance was not correct.");

        await CHF36Instance.transferFrom(accounts[ 1 ], accounts[ 2 ], 5, { from: accounts[ 3 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor1, "20", "The balance was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(newBalanceFor2, "30", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(totalSupply, "50", "The totalSupply was not correct.");

        var tokenHolders = await CHF36ControllerInstance.allHolders();
        assert.equal(tokenHolders.length, 2, "The tokenHolders were not correct.");
    });

    it("...it should not allow to transfer if accounts[2] is on blacklist.", async function () {
        var enabled = await CHF36ControllerInstance.isUserEnabled(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await CHF36ControllerInstance.enableUser(accounts[ 2 ], false, { from: accounts[ 0 ] });

        enabled = await CHF36ControllerInstance.isUserEnabled(accounts[ 2 ]);
        assert.equal(enabled, false, "The user was not disabled.");

        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await CHF36Instance.transfer(accounts[ 1 ], 5, { from: accounts[ 2 ] });
        //assert.equal(result, false, "The result of transfer was not correct.");

        var newBalanceFor2 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor2, "20", "The balance was not correct.");

        await CHF36ControllerInstance.enableUser(accounts[ 2 ], true, { from: accounts[ 0 ] });

        enabled = await CHF36ControllerInstance.isUserEnabled(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await CHF36Instance.transfer(accounts[ 1 ], 5, { from: accounts[ 2 ] });

        var newBalanceFor2After = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor2After, "25", "The balance was not correct.");
    });
});