require('@babel/polyfill')

const HDWalletProvider = require('@truffle/hdwallet-provider')

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
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '85458545',
      gas:          6000000,
      gasPrice: 10000000000
    },
    kovan_infura: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://kovan.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 42,
      gas:          6000000,
      gasPrice: 10000000000
    },  
    ropsten_infura: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 3,
      gas:          6000000,
      gasPrice: 10000000000
    },   
    rinkeby_infura: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 4,
      gas:          6000000,
      gasPrice: 10000000000
    },   
    goerli_infura: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://goerli.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 5,
      gas:          6000000,
      gasPrice: 10000000000
    },
    main_infura: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/46919ce6487b4a8b83d0a870ad59588c"),
      network_id: 1,
      gas: 9500000,
      gasPrice: 25900000000,  // 10 gwei (default: 20 gwei) https://ethgasstation.info/ --52 000 000 000
      confirmations: 2,       // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false 
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
