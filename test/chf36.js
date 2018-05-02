/**
 * Contains all Test regarding CHF36
 */
import expectThrow from "./helpers/expectThrow";


const Cash36 = artifacts.require("./Cash36.sol");
const SimpleKYC = artifacts.require("./SimpleKYC.sol");
const Token36 = artifacts.require("./Token36.sol");
const Token36Controller = artifacts.require("./Token36Controller.sol");


contract('Create and Test CHF36', function (accounts) {

    var Cash36Instance;
    var SimpleKYCInstance;
    var CHF36Instance;
    var CHF36ControllerInstance;

    before("...get invest36Instance.", async function () {
        Cash36Instance = await Cash36.deployed();
        SimpleKYCInstance = await SimpleKYC.deployed();

        await Cash36Instance.addExchange(accounts[ 0 ]);

        await Cash36Instance.createNewToken('CHF36 Token', 'CHF36', SimpleKYCInstance.address, { from: accounts[ 0 ] });
        var tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36');
        CHF36Instance = await Token36.at(tokenAddress);

        var tokenControllerAddress = await Cash36Instance.getTokenController(tokenAddress);
        CHF36ControllerInstance = await Token36Controller.at(tokenControllerAddress);
    });

    it("...it should mint 100 CHF36 and assign it to accounts[1].", async function () {
        await SimpleKYCInstance.attestUser(accounts[ 1 ]);

        await CHF36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 0 ] });

        var newBalanceFor1 = await CHF36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor1, "100", "The balance was not correct.");

        var totalSupply = await CHF36Instance.totalSupply();
        assert.equal(totalSupply, "100", "The totalSupply was not correct.");

        var tokenHolders = await CHF36ControllerInstance.allHolders();
        assert.equal(tokenHolders.length, 1, "The tokenHolders were not correct.");
    });

    it("...it should not allow minitng from another account.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(CHF36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
    });

    it("...it should burn 50 CHF36 and remove it from accounts[1].", async function () {
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
        //await CHF36Instance.transfer(accounts[ 2 ], 25, { from: accounts[ 1 ] });
    });

    it("...it should allow to transfer 25 CHF36 to accounts[2].", async function () {
        await SimpleKYCInstance.attestUser(accounts[ 2 ]);

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
});