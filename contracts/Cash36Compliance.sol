pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./HasOfficer.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users, users blacklist and white-listed exchanges.
/// @author element36.io
contract Cash36Compliance is Ownable, HasOfficer {

    // Tracks KYCed users
    mapping(address => bool) internal users;

    // Tracks blacklisted users - 'overrides' KYCed users
    mapping(address => bool) internal blacklist;

    // Tracks current User transfer limits
    mapping(address => uint256) internal userLimits;

    // Whitelisted Exchanges per token
    mapping(address => address[]) internal allExchanges;
    mapping(address => mapping(address => bool)) internal allowedExchanges;

    /**
     * @notice Add user once he passed KYC process
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the KYCed user
     */
    function addUser(address _user) public onlyComplianceOfficer {
        users[_user] = true;
        userLimits[_user] = 1000;
    }

    /**
     * @notice Check User if registered, its limits and Blacklist
     * @param _user Address of the user
     * @return {
     *   "bool": "True when User is KYCed, within limits and not on Blacklist"
     * }
     */
    function checkUser(address _user) public view returns (bool) {
        if (users[_user] && !blacklist[_user]) {
            return true;
        }
        return false;
    }

    function checkUserLimit(address _user, uint256 _amount, uint256 _balance) public view returns (bool) {
        if (_balance + _amount < userLimits[_user]) {
            return true;
        }
        return false;
    }

    function getUserLimit(address _user) public view returns (uint256) {
        return userLimits[_user];
    }

    function setUserLimit(address _user, uint256 _limit) public onlyComplianceOfficer {
        userLimits[_user] = _limit;
    }

    /**
     * @notice Blocking User by adding him onto the Blacklist
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     */
    function blockUser(address _user) public onlyComplianceOfficer {
        blacklist[_user] = true;
    }

    /**
     * @notice Unblocking User by removing him from the Blacklist
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     */
    function unblockUser(address _user) public onlyComplianceOfficer {
        blacklist[_user] = false;
    }

    /**
     * @notice Check User if on Blacklist
     * @param _user Address of the user
     * @return {
     *   "bool": "True when User is listed on Blacklist"
     * }
     */
    function isOnBlacklist(address _user) public view returns (bool) {
        return blacklist[_user];
    }

    /**
     * @notice Add an exchange to the list of accepted Exchanges
     * @dev Exchange can not be another Smart Contract
     * @dev onlyOwner - only open to element36 Account
     * @param _exchange Address of the exchange
     */
    function addExchange(address _exchange, address _token) external onlyOwner {
        require(isContract(_exchange) == false);
        allExchanges[_token].push(_exchange);
        allowedExchanges[_token][_exchange] = true;
    }

    /**
     * @notice Remove an exchange from the list of accepted Exchanges
     * @dev onlyOwner - only open to element36 Account
     * @param _exchange Address of the exchange
     */
    function removeExchange(address _exchange, address _token) external onlyOwner {
        allowedExchanges[_token][_exchange] = false;
    }

    /**
     * @notice Check if an exchange is on the list of accepted Exchanges
     * @param _exchange Address of the exchange
     * @return {
     *   "bool": "True when Exchange is listed"
     * }
     */
    function isAllowedExchange(address _exchange, address _token) external view returns (bool) {
        return allowedExchanges[_token][_exchange];
    }

    /**
     * @notice Returns all registered exchange addresses for a given token address.
     * @dev Note: Due to limitations of solidity, this method returns the full list of every address ever registered.
     * @dev It does not consider exchanges, which might have been flagged false afterwards.
     * @dev Therefore to be sure, an additional call to isAllowedExchange, would be necessary.
     * @param _token Address of the token
     * @return {
     *   "address[]": List of address of exchanges
     * }
    */
    function getAllowedExchanges(address _token) external view returns (address[]) {
        return allExchanges[_token];
    }

    /// INTERNAL

    /**
      @notice Checks if a given address is a contract or EOA
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