pragma solidity 0.4.19;

import "./Controlled.sol";


/// @title
/// @author element36.io
contract CHF36Controller is Controlled {

    function onTransfer(address sender, address receiver) constant returns(bool) {
        return true;
    }
}