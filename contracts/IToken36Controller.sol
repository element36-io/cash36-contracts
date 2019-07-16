pragma solidity ^0.5.9;


/// @title Token Controller Interface
/// @author element36.io
contract IToken36Controller {
    function onTransfer(address _from, address _to, uint _amount) public view returns(bool);
    function onBurn(address _from) public view returns(bool);
}