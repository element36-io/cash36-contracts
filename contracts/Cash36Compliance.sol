pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./HasOfficer.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users and whitelisted exchanges.
/// @author element36.io
contract Cash36Compliance is Ownable, HasOfficer {

    // Tracks KYCed users
    mapping(address => bool) internal users;

    // Tracks blacklisted users - 'overrides' KYCed users
    mapping(address => bool) internal blacklist;

    // Whitelisted Exchanges per token
    mapping(address => mapping(address => bool)) internal allowedExchanges;

    function addUser(address _user) public onlyComplianceOfficer {
        users[_user] = true;
    }

    /**
      @notice Check user for a valid claim from cash36
      @dev Forwards to EthereumClaimsRegistry by uport
      @param _user Address of the user
      @return {
        "done": "if done"
      }
    */
    function checkUser(address _user) public view returns (bool) {
        if (users[_user] && !blacklist[_user]) {
            return true;
        }
        return false;
    }

    function blockUser(address _user) public onlyComplianceOfficer {
        blacklist[_user] = true;
    }

    function unblockUser(address _user) public onlyComplianceOfficer {
        blacklist[_user] = false;
    }

    function isOnBlacklist(address _user) public view returns (bool) {
        return blacklist[_user];
    }

    /**
      @notice Add an exchange to the whitelist
      @param _exchange Address of the exchange
    */
    function addExchange(address _exchange, address _token) external onlyOwner {
        require(isContract(_exchange) == false);
        allowedExchanges[_token][_exchange] = true;
    }

    /**
      @notice Remove an exchange from the whitelist
      @param _exchange Address of the exchange
    */
    function removeExchange(address _exchange, address _token) external onlyOwner {
        allowedExchanges[_token][_exchange] = true;
    }

    /**
      @notice Check if an exchange is on the whitelist
      @param _exchange Address of the exchange
    */
    function isAllowedExchange(address _exchange, address _token) external view returns (bool) {
        return allowedExchanges[_token][_exchange];
    }

    /// INTERNAL
    /**
      @notice Checks if a given address if a contract or EOA
      @param _address Address to check
    */
    function isContract(address _address) internal view returns(bool) {
        uint size;
        if (_address == 0) {
            return false;
        }
        assembly {
            size := extcodesize(_address)
        }
        return size > 0;
    }
}