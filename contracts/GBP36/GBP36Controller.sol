pragma solidity ^0.4.24;

import "./../Token36Controller.sol";


/// @title GBP36 Token Controller Contract
/// @author element36.io
contract GBP36Controller is Token36Controller {

    // Constructor
    constructor(Token36 _token, address _compliance) public {
        token = _token;
        compliance = Cash36Compliance(_compliance);
    }
}