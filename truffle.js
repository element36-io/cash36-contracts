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
        local: {
            host: "localhost",
            port: 8558,
            network_id: "85588558",
            gas: 6721975,
            gasPrice: 20000000000,
        },
        test: {
            host: "167.99.243.81",
            port: 8866,
            network_id: 4,
            gas: 0x2fefd5
        }
    }
};
