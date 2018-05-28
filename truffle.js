require('babel-register');
require('babel-polyfill');

module.exports = {
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
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
            network_id: "85588558",
            gas: 6721975,
            gasPrice: 20000000000,
        },
        local_parity: {
            host: "localhost",
            port: 8545,
            network_id: 10,
            gas: 0x2fefd0
        },
        local_dev: {
            host: "localhost",
            port: 8666,
            network_id: 10,
            gas: 0x2fefd5
        },
        dev: {
            host: "167.99.243.81",
            port: 6688,
            network_id: 10,
            gas: 0x2fefd5
        },
        test: {
            host: "167.99.243.81",
            port: 8866,
            network_id: 4,
            gas: 0x2fefd5
        }
    }
};
