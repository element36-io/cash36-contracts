'use strict';

var Cash36 = require('./build/contracts/Cash36');
var SimpleKyc = require('./build/contracts/SimpleKYC');
var Token36 = require('./build/contracts/Token36.json');
var Token36Controller = require('./build/contracts/Token36Controller.json');

module.exports = {
    Cash36Contract: Cash36,
    SimpleKyc: SimpleKyc,
    Token36Contract: Token36,
    Token36ControllerContract: Token36Controller,
};