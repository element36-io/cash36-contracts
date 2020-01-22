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

### Successfully built with node  lts/dubnium (-> v10.18.1)

Install nvm - see https://github.com/nvm-sh/nvm

nvm install lts/carbon 
nvm use lts/carbon
yarn install
yarn testrpc
yarn test


### Local development with current state in ./data

ganache-cli -d -i 85458545 -b 5 -h 0.0.0.0 --db=./data -a 1

[Current network config is here ](network.md)
