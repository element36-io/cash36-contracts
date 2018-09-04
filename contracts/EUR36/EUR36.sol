pragma solidity ^0.4.24;

import "./../Token36.sol";


/// @title EUR36 Token Contract
/// @author element36.io
contract EUR36 is Token36 {

    // Constructor
    constructor() public {
        symbol = "EUR36";
        name = "Euro";
    }
}