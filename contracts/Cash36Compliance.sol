pragma solidity ^0.5.9;

import "./HasOfficer.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users (and possibly Companies), blacklist and attributes.
/// @notice Changes to users can only be done be assigned compliance officer (=part of Compliance Backend Service)
/// @author element36.io
contract Cash36Compliance is HasOfficer {

    // Tracks KYCed users and companies
    mapping(address => bool) private users;
    mapping(address => bool) private companies;

    // Allow attributes for KYCed Users for a better ACL like BUY, SELL, SEND, RECEIVE
    struct Attribute {
        bytes32 attribute;
        uint256 value;
    }
    mapping(address => mapping(bytes32 => Attribute)) private attributes;

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
        userLimits[_user] = uint256(-1);
        attributes[_user]["ATTR_BUY"] = Attribute("ATTR_BUY", 1);
    }

    /**
     * @notice Add company once it passed KYC process - after that Company is handled as a User
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _company Address of the KYCed company
     */
    function addCompany(address _company) public onlyComplianceOfficer {
        users[_company] = true;
        companies[_company] = true;
        userLimits[_company] = uint256(-1);
        attributes[_company]["ATTR_BUY"] = Attribute("ATTR_BUY", 1);
        attributes[_company]["ATTR_SELL"] = Attribute("ATTR_SELL", 1);
        attributes[_company]["ATTR_RECEIVE"] = Attribute("ATTR_RECEIVE", 1);
        attributes[_company]["ATTR_SEND"] = Attribute("ATTR_SEND", 1);
    }

    /**
     * @notice Check if a registered address is a KYCed element36 company
     * @param _company Address of the user
     * @return {
     *   "bool": "True when User is a registered company"
     * }
     */
    function isCompany(address _company) public view returns (bool) {
        return companies[_company];
    }

    /**
     * @notice Check User if registered and if on blacklist or account is locked
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

    /**
     * @notice Set an attribute of the User
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     * @param _attribute Name of the attribute
     * @param _value value of the attribute (1 or 0)
     */
    function setAttribute(address _user, bytes32 _attribute, uint256 _value) public onlyComplianceOfficer {
        attributes[_user][_attribute] = Attribute(_attribute, _value);
    }

    /**
     * @notice Check if a User has a given attribute
     * @param _user Address of the user
     * @param _attribute Name of the attribute
     */
    function hasAttribute(address _user, bytes32 _attribute) public view returns (bool) {
        return attributes[_user][_attribute].value != 0;
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

    /**
     * @notice Lock the account of a given user - Irreversible call - like Credit card
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     */
    function lockAccountForever(address _user) public onlyComplianceOfficer {
        lockedAccounts[_user] = true;
    }
}