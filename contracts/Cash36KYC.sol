pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./lib/uport/EthereumClaimsRegistry.sol";


/// @title Cash36 Index Contract
/// @author element36.io
contract Cash36KYC is Ownable {

    address cash36MNID;
    address registryAddress;

    // Constructor
    function Cash36KYC(address _registryAddress, address _cash36MNID) public {
        registryAddress = _registryAddress;
        cash36MNID = _cash36MNID;
    }

    /**
     * @notice Check user for a valid claim from cash36
     * @dev Forwards to EthereumClaimsRegistry by uport
     * @param _user Address of the user
     */
    function checkUser(address _user) external view returns(bool) {
        EthereumClaimsRegistry registry = EthereumClaimsRegistry(registryAddress);
        bytes32 claim = registry.getClaim(cash36MNID, _user, "cash36KYC");
        return claim != "";
    }

    /**
     * @notice Remove the claim from the user
     * @dev Forwards to EthereumClaimsRegistry by uport
     * @param _user Address of the user
     */
    function removeClaim(address _user) external {
        EthereumClaimsRegistry registry = EthereumClaimsRegistry(registryAddress);
        registry.removeClaim(cash36MNID, _user, "cash36KYC");
    }
}