'use strict';
//const promisify = require("es6-promisify");

class Registry {

  getAddress() {
    return this.registryContract.address;
  }

  //async offersCount() {
  //  return await promisify(this.marketContract.productCount)();
  //}  
}

module.exports = Registry;
