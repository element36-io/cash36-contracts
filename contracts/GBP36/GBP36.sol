pragma solidity ^0.5.7;

import "./../Token36.sol";


/// @title GBP36 Token Contract
/// @author element36.io
contract GBP36 is Token36 {

    // Constructor
    constructor() public ERC20Detailed("British Pounds", "GBP36", 18) {
    }
}