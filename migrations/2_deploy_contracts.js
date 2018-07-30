var Cash36 = artifacts.require("./Cash36.sol");
var Cash36Compliance = artifacts.require("./Cash36Compliance.sol");
var CHF36Controller = artifacts.require("./CHF36/CHF36Controller.sol");
var CHF36 = artifacts.require("./CHF36/CHF36.sol");
var EUR36Controller = artifacts.require("./EUR36/EUR36Controller.sol");
var EUR36 = artifacts.require("./EUR36/EUR36.sol");

module.exports = function (deployer) {
    deployer.then(async () => {
        await deployer.deploy(Cash36Compliance);
        await deployer.deploy(Cash36);

        let cash36 = await Cash36.deployed();

        await deployer.deploy(CHF36);
        await deployer.deploy(CHF36Controller, CHF36.address, Cash36Compliance.address);

        cash36.registerToken('CHF36', CHF36.address);

        let chf36Controller = await CHF36Controller.deployed();
        chf36Controller.transferOwnership(Cash36.address);

        let chf36 = await CHF36.deployed();
        chf36.changeController(CHF36Controller.address);

        await deployer.deploy(EUR36);
        await deployer.deploy(EUR36Controller, EUR36.address, Cash36Compliance.address);

        cash36.registerToken('EUR36', EUR36.address);

        let eur36Controller = await EUR36Controller.deployed();
        eur36Controller.transferOwnership(Cash36.address);

        let eur36 = await EUR36.deployed();
        eur36.changeController(EUR36Controller.address);
    });
};
