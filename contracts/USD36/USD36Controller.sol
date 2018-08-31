pragma solidity ^0.4.24;

import "./../Token36Controller.sol";


/// @title USD36 Token Controller Contract
/// @author element36.io
contract EUR36Controller is Token36Controller {

    // Constructor
    constructor(Token36 _token, address _compliance) public {
        token = _token;
        compliance = Cash36Compliance(_compliance);
    }
}