pragma solidity ^0.5.7;

import "./../Token36.sol";


/// @title CHF36 Token Contract
/// @author element36.io
contract CHF36 is Token36 {

    // Constructor
    constructor() public ERC20Detailed("Swiss Franc", "CHF36", 18) {
    }
}