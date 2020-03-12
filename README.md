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

Add MNENOMIC environment variable for HD Wallet. 
- run 'yarn deploy:testrpc'

This starts a local testrpc client and deploys the contracts.

Start with exising blockchain data 
- run 'yarn testrpcdata'

### Successfully built with node  lts/dubnium (-> v10.18.1)

Install nvm - see https://github.com/nvm-sh/nvm

nvm install lts/carbon 
nvm use lts/carbon
yarn install
yarn testrpc
yarn test

### Migrate and new packages

With Metamask (chrome)- go to Settings/Security/Reveal pass phrase words and set MNENOMIC to the passphase:
export MNENOMIC="blat"

yarn deploy:kovan
yarn deploy:rinkeby
yarn deploy:main


### Create local ganache docker image:

Update the local ganche-docker blockchain: 

sudo docker ps
export contid="7bb20a9a97ae"
sudo docker exec -it $contid ls
sudo docker exec -it $contid tar -zcvf data.tar.gz   ./data/
sudo docker cp $contid:/app/data.tar.gz /home/w/workspace/contracts/

w@x1:~/workspace/contracts/data$ mv data data_old
w@x1:~/workspace/contracts/data$ tar -xvzf data.tar.gz 

mv ./data ./data-sik; mkdir ./data; 
yarn testrpcdata &
yarn deploy:local

sudo docker login registry.gitlab.com/cash36/contracts
sudo docker build -t  registry.gitlab.com/cash36/contracts:latest .
sudo docker push registry.gitlab.com/cash36/contracts:latest

yarn networks > networks.md

Check in contrats and merge master which creates a new tag in gitlab and 
deployment of the package on github

Add new version to package.json: 
- cash36-admin-frontend
- cash36-compliance
- cash36-exchange

And rebuild dependencies and stubs:

( cd cash36-admin-frontend; git pull; yarn; ) 
( cd cash36-exchange; git pull; gradle build; gradle genToken36Controller genCash36Exchange ;gradle test ) 
( cd cash36-compliance; git pull; gradle build; gradle genCash36Compliance genCash36Company; gradle t

Push & merge to master to create new docker images, test local installation with 
cd cash36-docker
docker-compose up



### Network address from truffle migrate

[Current network config is here ](network.md)


### Public on github

[github instructions ](publicgithub.md)

### Useful links
https://github.com/ConsenSys/smart-contract-best-practices
