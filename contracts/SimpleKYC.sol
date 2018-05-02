pragma solidity 0.4.21;


contract SimpleKYC {

    mapping(address => bool) users;

    function attestUser(address _user) public {
        users[_user] = true;
    }

    function checkUser(address _user) public view returns(bool) {
        return users[_user];
    }
}