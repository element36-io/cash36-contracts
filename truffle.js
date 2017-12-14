require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    coverage: {
      host: "localhost",
      port: 8555,
      network_id: "*",
      gas: 0xfffffffffff,
      gasPrice: 0x01 
    },
    local_testrpc: {
      host: "localhost",
      port: 8558,
      network_id: "85588558"
    },
    local_parity: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  }
};
