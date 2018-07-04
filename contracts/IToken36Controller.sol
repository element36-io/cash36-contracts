pragma solidity ^0.4.24;


/// @title Token Controller Interface
/// @author element36.io
contract IToken36Controller {
    function onTransfer(address _from, address _to, uint _amount) public view returns(bool);
}