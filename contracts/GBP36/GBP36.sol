pragma solidity ^0.4.24;

import "./../Token36.sol";


/// @title GBP36 Token Contract
/// @author element36.io
contract GBP36 is Token36 {

    // Constructor
    constructor() public {
        symbol = "GBP36";
        name = "British Pounds";
    }
}