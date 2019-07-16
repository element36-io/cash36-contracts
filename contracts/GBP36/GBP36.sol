pragma solidity ^0.5.9;

import "./../Token36.sol";


/// @title GBP36 Token Contract
/// @author element36.io
contract GBP36 is Token36 {

    // Constructor
    // Initial cap of 500'000 Tokens given by current sandbox limitation
    /* solium-disable-next-line */
    constructor() public Token36("British Pounds", "GBP36", 18, 500000 * 10**18) {
    }
}