var Cash36 = artifacts.require("./Cash36.sol");
var Cash36Compliance = artifacts.require("./Cash36Compliance.sol");

module.exports = function (deployer) {
    deployer.deploy(Cash36Compliance).then(function() {
        return deployer.deploy(Cash36, Cash36Compliance.address);
    });

};
