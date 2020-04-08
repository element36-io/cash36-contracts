  
Remove from package.json:

 "repository": {
    "type": "git",
    "url": "git+https://gitlab.com/cash36/contracts.git"
  },

otherwise following error.   
npm ERR! code E400
npm ERR! 400 Bad Request - PUT https://npm.pkg.github.com/@element36-io%2fcash36-contracts - failed to stream package from json: invalid repo host 'gitlab.com', only github (github.com) repositories allowed

Set up enviroment:  

~/.npmrc
@element36-io:registry=https://npm.pkg.github.com/
registry=https://npm.pkg.github.com/element36-io
//npm.pkg.github.com/:_authToken=token

Deploy github manually: 
npm i -g @hutson/npm-deploy-git-tag 
nvm use lts/dubnium
git pull
Remark: uses NPM_TOKEN from gitlab, https://gitlab.com/profile/personal_access_tokens, (see setenv.txt, NPM_TOKEN, current token ends with d7, or create a new one: https://github.com/settings/tokens, )

npm-deploy-git-tag --token _tokenhere_ 
yarn --registry https://registry.yarnpkg.com 


Workflow-Flow: 
 - Make your changes, push to gitlab, make sure repo is active:  "repository": {  is in package.json
 - git pull, make sure  repo is deactivated in package.json :    "repository_": {  is in package.json
 - npm-deploy-git-tag --token _tokenhere_ 
 


On troubles: 
- generate new token (github, Settings, Developer Settings, Private..)
- export NPM_TOKEN=dksfj
- Commit message: https://www.conventionalcommits.org/en/v1.0.0-beta.2/
- yarn  --registry https://registry.yarnpkg.com  semantic-delivery-gitlab  --dry-run
- npm-deploy-git-tag --token _tokenhere_ 

sudo npm i @hutson/npm-deploy-git-tag
npm ERR! Cannot read property 'match' of undefined
OR Scrypt errors  ==> nvm use lts/dubnium (delete node-modules and package-lock)
