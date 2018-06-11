var Cash36 = artifacts.require("./Cash36.sol");
var Cash36KYC = artifacts.require("./Cash36KYC.sol");
var EthereumClaimsRegistry = artifacts.require("./lib/uport/EthereumClaimsRegistry.sol");

module.exports = function (deployer, network) {
    console.log(network);
    // On private network, we will deploy our own instance of
    // EthereumClaimsRegistry, otherwise we use the official one.
    if (network !== 1 || network !== 4) {
        deployer.deploy(EthereumClaimsRegistry).then(() => {
            deployer.deploy(Cash36KYC, EthereumClaimsRegistry.address);
        });
    } else {
        deployer.deploy(Cash36KYC, 0xAcA1BCd8D0f5A9BFC95aFF331Da4c250CD9ac2Da);
    }
    deployer.deploy(Cash36);
};
