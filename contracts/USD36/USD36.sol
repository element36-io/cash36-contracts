pragma solidity ^0.4.24;

import "./../Token36.sol";


/// @title Cash36 Main Index Contract
/// @notice Main Contract of cash36. Acts as an Index to keep track of all official cash36 contracts and more.
/// @author element36.io
contract USD36 is Token36 {

    // Constructor
    constructor() public {
        symbol = "USD36";
        name = "US Dollar";
    }
}