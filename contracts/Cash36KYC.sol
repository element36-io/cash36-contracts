pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./lib/uport/EthereumClaimsRegistry.sol";


/// @title Cash36 Index Contract
/// @author element36.io
contract Cash36KYC is Ownable {

    address cash36MNID;
    address registryAddress;

    function Cash36KYC(address _registryAddress, address _cash36MNID) {
        registryAddress = _registryAddress;
        cash36MNID = _cash36MNID;
    }

    function checkUser(address _user) public view returns(bool) {
        EthereumClaimsRegistry registry = EthereumClaimsRegistry(registryAddress);
        bytes32 claim = registry.getClaim(cash36MNID, _user, "cash36KYC");
        return claim != "";
    }
}