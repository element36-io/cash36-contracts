pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./lib/uport/EthereumClaimsRegistry.sol";


/// @title Cash36 Index Contract
/// @author element36.io
contract Cash36KYC is Ownable {

    address cash36MNID = 0x122bd1a75ae8c741f7e2ab0a28bd30b8dbb1a67e;
    address registryAddress;

    function Cash36KYC(address _registryAddress) {
        registryAddress = _registryAddress;
    }

    function checkUser(address _user) public view returns(bool) {
        EthereumClaimsRegistry registry = EthereumClaimsRegistry(registry);
        bytes32 claim = registry.getClaim(cash36MNID, _user, "cash36KYC");
        return claim != "";
    }
}