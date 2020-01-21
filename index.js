'use strict';

var Cash36 = require('./build/contracts/Cash36.json');
var Cash36Compliance = require('./build/contracts/Cash36Compliance.json');
var Cash36Exchanges = require('./build/contracts/Cash36Exchanges.json');
var Cash36Company = require('./build/contracts/Cash36Company.json');
var Token36 = require('./build/contracts/Token36.json');
var Ping = require('./build/contracts/Ping.json');


module.exports = {
    Cash36Contract: Cash36,
    Cash36ComplianceContract: Cash36Compliance,
    Cash36ExchangesContract: Cash36Exchanges,
    Cash36CompanyContract: Cash36Company,
    Token36Contract: Token36,
    PingContract: Ping,
};