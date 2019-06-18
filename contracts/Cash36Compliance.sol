pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./HasOfficer.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users, users blacklist and attributes.
/// @author element36.io
contract Cash36Compliance is Ownable, HasOfficer {

    // Tracks KYCed users
    mapping(address => bool) private users;

    // Allow attributes for KYCed Users for a better ACL like BUY, SELL, SEND, RECEIVE
    struct Attribute {
        bytes32 attribute;
        uint256 value;
    }
    mapping(address => mapping(bytes32 => Attribute)) attributes;

    // Tracks current User transfer limits
    mapping(address => uint256) private userLimits;

    // Tracks blacklisted users - 'overrides' KYCed users
    mapping(address => bool) private blacklist;

    // Tracks forever locked accounts - like Credit cards - no unlocks
    mapping(address => bool) private lockedAccounts;

    /**
     * @notice Add user once he passed KYC process
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the KYCed user
     */
    function addUser(address _user) public onlyComplianceOfficer {
        users[_user] = true;
        userLimits[_user] = 200;
    }

    /**
     * @notice Check User if registered and if on blacklist
     * @param _user Address of the user
     * @return {
     *   "bool": "True when User is KYCed and not on Blacklist"
     * }
     */
    function checkUser(address _user) public view returns (bool) {
        if (users[_user] && !blacklist[_user] && !lockedAccounts[_user]) {
            return true;
        }
        return false;
    }

    /**
     * @notice Check if a given amount is within the current limit of the User
     * @param _user Address of the user
     * @param _amount Amount of the transaction
     * @param _balance Current balance of the user
     * @return {
     *   "bool": "True when balance plus amount is smaller than the user limit"
     * }
     */
    function checkUserLimit(address _user, uint256 _amount, uint256 _balance) public view returns (bool) {
        if (_balance + _amount <= userLimits[_user]) {
            return true;
        }
        return false;
    }

    /**
     * @notice Get the limit of the user
     * @param _user Address of the user
     * @return {
     *   "uint256": "The current user limit"
     * }
     */
    function getUserLimit(address _user) public view returns (uint256) {
        return userLimits[_user];
    }

    /**
     * @notice Set the limit of the user
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     * @param _limit New limit of the user
     */
    function setUserLimit(address _user, uint256 _limit) public onlyComplianceOfficer {
        userLimits[_user] = _limit;
    }

    /**
     * @notice Helper for web3j as passing -1 fails
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     */
    function setUserLimitToUnlimited(address _user) public onlyComplianceOfficer {
        userLimits[_user] = uint256(-1);
    }

    function setAttribute(address _who, bytes32 _attribute, uint256 _value) public onlyComplianceOfficer {
        attributes[_who][_attribute] = Attribute(_attribute, _value);
    }

    function hasAttribute(address _who, bytes32 _attribute) public view returns (bool) {
        return attributes[_who][_attribute].value != 0;
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

    // Irreversible call - like Credit card
    function lockAccountForever(address _user) public onlyComplianceOfficer {
        lockedAccounts[_user] = true;
    }
}