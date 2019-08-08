pragma solidity ^0.5.9;


/// @title Cash36 Interface holding the Compliance Officer
/// @author element36.io
contract HasOfficer {

    // Address of the controller
    address internal complianceOfficer;

    // Allow only complianceOfficer address to access
    modifier onlyComplianceOfficer {
        require(msg.sender == complianceOfficer, "access not allowed, only complianceOfficer");
        _;
    }

    // Constructor
    constructor() public {
        complianceOfficer = msg.sender;
    }

    function complianceOfficer() public view returns (address) {
        return complianceOfficer;
    }

    /**
     * @notice Changes the ComplianceOfficer of the contract
     * @dev onlyComplianceOfficer - only open to the currently assigned compliance Officer
     * @param _newComplianceOfficer The new compliance officer of the contract
     */
    function changeOfficer(address _newComplianceOfficer) public onlyComplianceOfficer {
        complianceOfficer = _newComplianceOfficer;
    }

    /**
     * @notice Check if given address it the assigned Compliance Officer
     * @param _addressToCheck Address to be checked
     * @return {
     *   "bool": "True when address is the currently assigned complianceOfficer"
     * }
     */
    function isOfficer(address _addressToCheck) public view returns (bool){
        return complianceOfficer == _addressToCheck;
    }
}