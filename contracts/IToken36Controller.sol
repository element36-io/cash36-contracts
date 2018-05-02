pragma solidity 0.4.21;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


/// @title
/// @author element36.io
contract IToken36Controller is Ownable {
    function proxyPayment(address _owner) public payable returns(bool);
    function onTransfer(address _from, address _to, uint _amount) public returns(bool);
    function onApprove(address _owner, address _spender, uint _amount) public returns(bool);
}