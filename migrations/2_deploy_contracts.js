var Cash36 = artifacts.require("./Cash36.sol");
var Cash36KYC = artifacts.require("./Cash36KYC.sol");


module.exports = function (deployer) {
    deployer.deploy(Cash36KYC);
    deployer.deploy(Cash36);
};
