var Cash36 = artifacts.require("./Cash36.sol");
var Cash36KYC = artifacts.require("./Cash36KYC.sol");
var EthereumClaimsRegistry = artifacts.require("./lib/uport/EthereumClaimsRegistry.sol");

module.exports = function (deployer, network, accounts) {
    // On private network, we will deploy our own instance of
    // EthereumClaimsRegistry, otherwise we use the official one.
    if (network !== 'main' && network !== 'test') {
        deployer.deploy(EthereumClaimsRegistry).then(function() {
            return deployer.deploy(Cash36KYC, EthereumClaimsRegistry.address, accounts[3]);
        });
    } else {
        deployer.deploy(Cash36KYC, 0xAcA1BCd8D0f5A9BFC95aFF331Da4c250CD9ac2Da, 0x122bd1a75ae8c741f7e2ab0a28bd30b8dbb1a67e);
    }
    deployer.deploy(Cash36);
};
