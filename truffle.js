require('@babel/polyfill')

const HDWalletProvider = require('@truffle/hdwallet-provider')

//require('dotenv').config()  // Store environment-specific variable from '.env' to process.env


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
      version: '0.5.15'
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
    development: {
      host: '0.0.0.0',
      port: 8545,
      network_id: '85458545',
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
    ganache: {
      host: 'localhost',
      port: 7545,
      network_id: '5777',
    },
    kovan_infura: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://kovan.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 42,
      gas:          6000000,
      gasPrice: 10000000000
    },  
    ropsten_infura: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ropsten.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 3,
      gas:          6000000,
      gasPrice: 10000000000
    },   
    rinkeby_infura: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://rinkeby.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 4,
      gas:          6000000,
      gasPrice: 10000000000
    },   
    goerli_infura: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://goerli.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 5,
      gas:          6000000,
      gasPrice: 10000000000
    }
    // test: {
    //   provider: getProvider('./keys.json', 'http://rinkeby.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c'),
    //   network_id: 42,
    // },

    // main: {
    //   provider: getProvider('./keys-prod.json', 'tbd33'),
    //   network_id: 1,
    //   gas: 0x2fefd5
    // }
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
