//const promisify = require("es6-promisify");

const DEPLOY_GAS_LIMIT = 3500000;

class Registry {

  constructor(registryJSON = require('../build/contracts/Registry.json')) {
    this.RegistryContract = web3.eth.contract(registryJSON.abi);
    this.data = registryJSON.unlinked_binary;
  }

  create(transactionHashCallback) {
    var transactionParams = {
      from: web3.eth.accounts[0],
      gas: DEPLOY_GAS_LIMIT,
      data: this.data
    }
    var self = this;

    return new Promise((resolve, reject) => {
      this.RegistryContract.new(transactionParams, async (err) => {
        if (err) {
          reject(err);
        } else if (!factoryContract.address && transactionHashCallback) {
          transactionHashCallback(factoryContract.transactionHash);
        } else if (factoryContract.address){          
          resolve(await self.fromAddress(await promisify(factoryContract.market)()));
        }
      });
    });
  }

  fromAddress(registryAddress) {
    var market = new Registry();
    market.marketContract = this.MarketContract.at(registryAddress);
    return market;
  }
}

module.exports = MarketRepository;