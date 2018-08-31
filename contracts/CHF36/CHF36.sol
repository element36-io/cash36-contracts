pragma solidity ^0.4.24;

import "./../Token36.sol";


/// @title CHF36 Token Contract
/// @author element36.io
contract CHF36 is Token36 {

    // Constructor
    constructor() public {
        symbol = "CHF36";
        name = "Swiss Franc";
    }
}