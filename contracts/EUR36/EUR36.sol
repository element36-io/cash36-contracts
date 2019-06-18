pragma solidity ^0.5.9;

import "./../Token36.sol";


/// @title EUR36 Token Contract
/// @author element36.io
contract EUR36 is Token36 {

    // Constructor
    constructor() public ERC20Detailed("Euro", "EUR36", 18) {
    }
}