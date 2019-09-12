require('babel-polyfill')

const HDWalletProvider = require('truffle-hdwallet-provider')

function getProvider (keysFile, rpcUrl) {
  let keys = {}
  try {
    keys = require(keysFile)
    return new HDWalletProvider(keys.privKey, rpcUrl)
  } catch (err) {
    console.log(err)
    console.log('could not find ' + keysFile)
  }
}

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  compilers: {
    solc: {
      version: '0.5.9'
    }
  },

  networks: {
    coverage: {
      host: 'localhost',
      port: 8555,
      network_id: '*',
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    localTest: {
      host: 'localhost',
      port: 8545,
      network_id: '85458545',
    },
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '85458545',
    },
    test: {
      provider: getProvider('./keys.json', 'http://167.99.243.81:8866'),
      network_id: 4,
      gas: 0x2fefd5
    },
    main: {
      provider: getProvider('./keys-prod.json', 'tbd'),
      network_id: 1,
      gas: 0x2fefd5
    }
  },

  mocha: {
    useColors: true,
    // Crashing since version update - no solution yet
    // reporter: 'eth-gas-reporter',
    // reporterOptions : {
    //   currency: 'CHF',
    //   gasPrice: 21
    // }
  }
}
