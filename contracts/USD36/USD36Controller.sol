pragma solidity ^0.5.9;

import "./../Token36Controller.sol";


/// @title USD36 Token Controller Contract
/// @author element36.io
contract USD36Controller is Token36Controller {

    // Constructor
    constructor(Token36 _token, address _compliance, address _exchanges) public {
        token = _token;
        compliance = Cash36Compliance(_compliance);
        exchanges = Cash36Exchanges(_exchanges);
    }
}