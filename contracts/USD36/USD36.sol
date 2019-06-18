pragma solidity ^0.5.7;

import "./../Token36.sol";


/// @title USD36 Token Contract
/// @author element36.io
contract USD36 is Token36 {

    // Constructor
    constructor() public ERC20Detailed("US Dollar", "USD36", 18) {
    }
}