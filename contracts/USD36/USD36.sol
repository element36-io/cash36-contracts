pragma solidity ^0.4.24;

import "./../Token36.sol";


/// @title USD36 Token Contract
/// @author element36.io
contract USD36 is Token36 {

    // Constructor
    constructor() public {
        symbol = "USD36";
        name = "US Dollar";
    }
}