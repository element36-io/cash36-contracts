pragma solidity ^0.4.24;

import "./../Token36Controller.sol";


/// @title Cash36 Main Index Contract
/// @notice Main Contract of cash36. Acts as an Index to keep track of all official cash36 contracts and more.
/// @author element36.io
contract EUR36Controller is Token36Controller {

    // Constructor
    constructor(Token36 _token, address _compliance) public {
        token = _token;
        compliance = Cash36Compliance(_compliance);
    }
}