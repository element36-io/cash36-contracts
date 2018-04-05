pragma solidity 0.4.19;


/// @title
/// @author element36.io
interface Controlled {
    function onTransfer(address sender, address receiver) constant returns(bool);
}