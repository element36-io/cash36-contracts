pragma solidity 0.4.19;


/// @title
/// @author element36.io
contract EUR36Controller is Controlled {

    function onTransfer(address sender, address receiver) constant returns(bool) {
        return true;
    }
}