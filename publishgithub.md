  
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

git pull

Remark: uses NPM_TOKEN from gitlab, https://gitlab.com/profile/personal_access_tokens, (see setenv.txt current token ends with d7, or create a new one: https://github.com/settings/tokens, )

npm-deploy-git-tag --token _tokenhere_ 

On troubles: 
- generate new token (github, Settings, Developer Settings, Private..)
- export NPM_TOKEN=dksfj
- npm-deploy-git-tag --token _tokenhere_ 


 