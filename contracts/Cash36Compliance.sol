pragma solidity ^0.5.9;

import "./HasOfficer.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users (and possibly Companies), blacklist and attributes.
/// @notice Changes to users can only be done be assigned compliance officer (=part of Compliance Backend Service)
/// @author element36.io
contract Cash36Compliance is HasOfficer {
    enum Attribs { EXST, BUY, SELL, RCV, SEND, CPNY, BLACK, LOCK }

    modifier userExists(address _user) {
        require(uint8(attributes[_user] & 1) == 1,  "account not found");
        _;
    }
    modifier userNotExists(address _user) {
        require(uint8(attributes[_user] & 1) == 0,  "account exists");
        _;
    }
    mapping(address => uint256) private attributes;
  
   
    /**
     * @notice Add user once he passed KYC process
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the KYCed user
     */
    function addUser(address _user) public onlyComplianceOfficer userNotExists(_user) {
        attributes[_user] = 3 + (5000*2**8); // Exst, buy   plus 5000 initial allowance
    }

    /**
     * @notice Sets ATTR_ attributes for initial activation (KYC-ing a user)
     * @param _user Address of the user
     */
    function activateUser(address _user) public onlyComplianceOfficer userExists(_user) {
        uint8 attribs = uint8(attributes[_user] & (2**8)-1);
        require(attribs<64, "invalid action"); // do not change if  locked or on blacklist
        attributes[_user] = attributes[_user] | 30; // buy, send, rcv, send
    }

     /**
     * @notice Sets ATTR_ attributes for deactivation of a user
     * @param _user Address of the user
     */
    function deactivateUser(address _user) public onlyComplianceOfficer userExists(_user) {
        uint256 mask = (2**256)-1 ^ 30;
        attributes[_user] = attributes[_user] & mask; // buy, send, rcv, send
    }


    /**
     * @notice Add company once it passed KYC process - after that Company is handled as a User
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _company Address of the KYCed company
     */
    function addCompany(address _company) public onlyComplianceOfficer userNotExists(_company) {
        attributes[_company] = 63; // exists, buy, send, rcv, send,company
    }

    /**
     * @notice Check if a registered address is a KYCed element36 company
     * @param _company Address of the user
     * @return {
     *   "bool": "True when User is a registered company"
     * }
     */
    function isCompany(address _company) public view returns (bool) {
        return uint8(attributes[_company]) & uint8(2**uint8(Attribs.CPNY)) == uint8(2**uint8(Attribs.CPNY));
    }

    /**
     * @notice Check User if registered and if on blacklist or account is locked
     * @param _user Address of the user
     * @return {
     *   "bool": "True when User is registereds and not on Blacklist"
     * }
     */
    function checkUser(address _user) public view userExists(_user)  returns (bool) {
        uint8 attribs = uint8(attributes[_user] & uint8((2**8)-1));
        return attribs<2**6; // locked, blacklist, > 64
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
    function checkUserLimit(address _user, uint256 _amount, uint256 _balance) public view userExists(_user) returns (bool) {
        uint256 userLimit = attributes[_user] / 2 ** 8;
        return (_balance + _amount <= userLimit);
    }

    /**
     * @notice Get the limit of the user
     * @param _user Address of the user
     * @return {
     *   "uint256": "The current user limit"
     * }
     */
    function getUserLimit(address _user) public view userExists(_user) returns (uint256) {
        return attributes[_user] / 2 ** 8; // left shift
    }

    /**
     * @notice Set the limit of the user
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     * @param _limit New limit of the user
     */
    function setUserLimit(address _user, uint256 _limit) public onlyComplianceOfficer userExists(_user) {
        require(_limit < (2 ** 248-1),"limit > max");

        uint8 attribs = uint8(attributes[_user] & (2**8)-1);
        attributes[_user] = _limit * 2 ** 8 + attribs;
    }

    /**
     * @notice Helper for web3j as passing -1 fails
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     */
    function setUserLimitToUnlimited(address _user) public onlyComplianceOfficer userExists(_user) {
        uint8 attribs = uint8(attributes[_user] & (2**8)-1);
        attributes[_user] = (2 ** 248-1) * 2 ** 8 + attribs;
    }

    function getAttribs(address _user) public view userExists(_user) returns (uint256) {
        return uint256(attributes[_user] & (2**8)-1);
    }


    /**
     * @notice Set an attribute of the User
     * @dev onlyComplianceOfficer - only open to assigned Compliance Officer Account
     * @param _user Address of the user
     * @param _attrib Enum of the attribute
     * @param _value value of the attribute - true or false
     */
    function setAttribute(address _user, Attribs _attrib, bool _value) public onlyComplianceOfficer userExists(_user) {
        require((_attrib == Attribs.LOCK && _value == false) == false, "LOCK is forever");

        if (_value) {
            attributes[_user] = attributes[_user] | uint8(2**uint8(_attrib));
        } else {
            uint256 mask = (2**256)-1 ^ 2**uint8(_attrib);
            attributes[_user] = attributes[_user] & mask;
        }
    }

    /**
     * @notice Check if a User has a given attribute
     * @param _user Address of the user
     * @param _attrib Enum of the attribute
     */
    function hasAttribute(address _user, Attribs _attrib) public view userExists(_user) returns (bool) {
        uint8 val = uint8(attributes[_user] & (2**8)-1);
        return uint8(val & uint8(2 ** uint8(_attrib))) == uint8(2 ** uint8(_attrib));
    }

}