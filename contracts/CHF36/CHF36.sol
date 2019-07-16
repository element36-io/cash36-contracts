pragma solidity ^0.5.9;

import "./../Token36.sol";


/// @title CHF36 Token Contract
/// @author element36.io
contract CHF36 is Token36 {

    // Constructor
    // Initial cap of 500'000 Tokens given by current sandbox limitation
    /* solium-disable-next-line */
    constructor() public Token36("Swiss Franc", "CHF36", 18, 500000 * 10**18) {
    }
}