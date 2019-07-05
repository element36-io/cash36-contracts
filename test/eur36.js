/**
 * Contains all Test regarding EUR36
 */
const Cash36 = artifacts.require("./Cash36.sol");
const Cash36Compliance = artifacts.require("./Cash36Compliance.sol");
const Cash36Exchanges = artifacts.require("./Cash36Exchanges.sol");
const Token36 = artifacts.require("./Token36.sol");
const Token36Controller = artifacts.require("./EUR36Controller.sol");

function format(value) {
  return value
  //return value * 10e18;
}

function parse(value) {
  return value
  //return value / 10e18;
}

contract('Create and Test EUR36', function (accounts) {

    var Cash36Instance;
    var Cash36ComplianceInstance;
    var Cash36ExchangesInstance;
    var EUR36Instance;
    var EUR36ControllerInstance;

    before("...get Cash36Instance.", async function () {
        Cash36Instance = await Cash36.deployed();
        Cash36ComplianceInstance = await Cash36Compliance.deployed();
        Cash36ExchangesInstance = await Cash36Exchanges.deployed();

        var tokenAddress = await Cash36Instance.getTokenBySymbol('EUR36');
        EUR36Instance = await Token36.at(tokenAddress);

        var tokenControllerAddress = await EUR36Instance.controller();
        EUR36ControllerInstance = await Token36Controller.at(tokenControllerAddress);

        await Cash36ExchangesInstance.addExchange(accounts[ 0 ], tokenAddress);
    });

  it("...it should allow to administrate cash36 contracts.", async function () {
        var compliance = await Cash36Instance.getCompliance('EUR36');
        assert.equal(compliance, Cash36Compliance.address, "The compliance address was not correct.");
  });

    it("...it should mint 100 EUR36 and assign it to accounts[1].", async function () {
        await Cash36ComplianceInstance.addUser(accounts[ 1 ], { from: accounts[ 0 ] });
        await Cash36ComplianceInstance.setUserLimit(accounts[ 1 ], format(1000), { from: accounts[ 0 ] });

        await EUR36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 0 ] });

        var newBalanceFor1 = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "100", "The balance was not correct.");

        var totalSupply = await EUR36Instance.totalSupply();
        assert.equal(parse(totalSupply), "100", "The totalSupply was not correct.");
    });

    it("...it should not allow minting from another account.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(EUR36ControllerInstance.mint(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
    });

    it("...it should not allow to burn 50 EUR36.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(EUR36ControllerInstance.burn(accounts[ 1 ], 50, { from: accounts[ 0 ] }));
    });

    it("...it should burn 50 EUR36 and remove it from accounts[1].", async function () {
        await EUR36ControllerInstance.burn(accounts[ 1 ], 50, { from: accounts[ 0 ] });

        var newBalanceForFee = await EUR36Instance.balanceOf(accounts[ 0 ]);
        assert.equal(parse(newBalanceForFee), "1", "The balance of feeCollector was not correct.");

        var newBalanceFor1 = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "50", "The balance of account was not correct.");

        var totalSupply = await EUR36Instance.totalSupply();
        assert.equal(parse(totalSupply), "51", "The totalSupply was not correct.");
    });

    it("...it should not allow burning from another account.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await expectThrow(EUR36ControllerInstance.burn(accounts[ 1 ], 100, { from: accounts[ 1 ] }));
    });

    it("...it should not allow to transfer 25 EUR36 to accounts[2] not being KYCed.", async function () {
        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await EUR36Instance.transfer(accounts[ 2 ], 25, { from: accounts[ 1 ] });
    });

    it("...it should allow to transfer 25 EUR36 to accounts[2].", async function () {
        await Cash36ComplianceInstance.addUser(accounts[ 2 ], { from: accounts[ 0 ] });
        await Cash36ComplianceInstance.setUserLimit(accounts[ 2 ], format(1000), { from: accounts[ 0 ] });

        await EUR36Instance.transfer(accounts[ 2 ], format(25), { from: accounts[ 1 ] });

        var newBalanceFor1 = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "25", "The balance was not correct.");

        var newBalanceFor2 = await EUR36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(parse(newBalanceFor2), "25", "The balance was not correct.");

        var totalSupply = await EUR36Instance.totalSupply();
        assert.equal(parse(totalSupply), "51", "The totalSupply was not correct.");
    });

    it("...it should allow to transferFrom 5 EUR36 to accounts[2] as accounts[3].", async function () {
        var allowance = await EUR36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(allowance, "0", "The allowance was not correct.");

        await EUR36Instance.approve(accounts[ 3 ], format(5), { from: accounts[ 1 ] })

        allowance = await EUR36Instance.allowance(accounts[ 1 ], accounts[ 3 ]);
        assert.equal(parse(allowance), "5", "The allowance was not correct.");

        await EUR36Instance.transferFrom(accounts[ 1 ], accounts[ 2 ], format(5), { from: accounts[ 3 ] });

        var newBalanceFor1 = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(parse(newBalanceFor1), "20", "The balance was not correct.");

        var newBalanceFor2 = await EUR36Instance.balanceOf(accounts[ 2 ]);
        assert.equal(parse(newBalanceFor2), "30", "The balance was not correct.");

        var totalSupply = await EUR36Instance.totalSupply();
        assert.equal(parse(totalSupply), "51", "The totalSupply was not correct.");
    });

    it("...it should not allow to transfer if accounts[2] is on blacklist.", async function () {
        var enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await Cash36ComplianceInstance.blockUser(accounts[ 2 ], { from: accounts[ 0 ] });

        enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, false, "The user was not disabled.");

        // TODO: figure out how to test throws in JS, otherwise write Sol Tests
        //await EUR36Instance.transfer(accounts[ 1 ], 5, { from: accounts[ 2 ] });
        //assert.equal(result, false, "The result of transfer was not correct.");

        var newBalanceFor2 = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor2, "20", "The balance was not correct.");

        await Cash36ComplianceInstance.unblockUser(accounts[ 2 ], { from: accounts[ 0 ] });

        enabled = await Cash36ComplianceInstance.checkUser(accounts[ 2 ]);
        assert.equal(enabled, true, "The user was not enabled.");

        await EUR36Instance.transfer(accounts[ 1 ], format(5), { from: accounts[ 2 ] });

        var newBalanceFor2After = await EUR36Instance.balanceOf(accounts[ 1 ]);
        assert.equal(newBalanceFor2After, "25", "The balance was not correct.");
    });
});