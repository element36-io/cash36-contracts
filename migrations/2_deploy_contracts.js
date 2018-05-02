var Cash36 = artifacts.require("./Cash36.sol");
var SimpleKYC = artifacts.require("./SimpleKYC.sol");


module.exports = function (deployer) {
    deployer.deploy(SimpleKYC);
    deployer.deploy(Cash36);
};
