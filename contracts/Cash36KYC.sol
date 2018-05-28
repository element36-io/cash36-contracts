pragma solidity 0.4.21;

contract Cash36KYC {

    address registry = 0xAcA1BCd8D0f5A9BFC95aFF331Da4c250CD9ac2Da;
    mapping(address => bool) users;

    function updateRegistry(address _registryAddress) public {
        registry = _registryAddress;
    }

    function attestUser(address _user) public {
        users[_user] = true;
    }

    function checkUser(address _user) public view returns(bool) {
        bool claim = registry.call(bytes4(keccak256("getClaim(address,address,bytes32)")), "2ozGXFqx3eKzmg7zQQZuTnEW6EeAVUzyUu6", _user, "cash36KYC");

        return users[_user];
    }
}