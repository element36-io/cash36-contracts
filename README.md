# invest36 Crypto-Backend
## Smart Contracts

This is the decentralized backend for invest36 and contains all relevant Smart Contracts and Tests.

## Build Status
#### Branch master:
[![pipeline status](https://gitlab.com/invest36/contracts/badges/master/pipeline.svg)](https://gitlab.com/invest36/contracts/commits/master) [![coverage report](https://gitlab.com/invest36/contracts/badges/master/coverage.svg)](https://gitlab.com/invest36/contracts/commits/master)

#### Branch develop:
[![pipeline status](https://gitlab.com/invest36/contracts/badges/develop/pipeline.svg)](https://gitlab.com/invest36/contracts/commits/develop) [![coverage report](https://gitlab.com/invest36/contracts/badges/develop/coverage.svg)](https://gitlab.com/invest36/contracts/commits/develop)

## Smart Contract Development

### Usage with dapp local

Needs yarn to be installed globaly.
see https://yarnpkg.com/lang/en/docs/install/
---
- Clone repo
- Checkout Branch develop
- run 'yarn'
- run 'yarn testrpc'
- run 'yarn deploy:testrpc'

This starts a local testrpc client and deploys the contracts.

Start with exising data: 
- run 'yarn testrpcdata'


### Useful links
https://github.com/ConsenSys/smart-contract-best-practices


### Local development with current state in ./data

w@x1:~/workspace/contracts$ ganache-cli -d -i 85458545 -b 5 -h 0.0.0.0 --db=./data -a 1

0x6d1cf1a3d5f7868f0a13c76262ed4683e1f61a0e: 10 kCHF, 10k kEUR
0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1: 20 kCHF, 20k kEUR
