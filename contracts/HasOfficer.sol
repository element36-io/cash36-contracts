pragma solidity ^0.4.24;


/// @title Cash36 Interface holding the Compliance Officer
/// @author element36.io
contract HasOfficer {

    // Address of the controller
    address public complianceOfficer;

    // Allow only complianceOfficer address to access
    modifier onlyComplianceOfficer {
        require(msg.sender == complianceOfficer);
        _;
    }

    // Constructor
    constructor() public {
        complianceOfficer = msg.sender;
    }

    /**
     * @notice Changes the ComplianceOfficer of the contract
     * @dev onlyComplianceOfficer - only open to the currently assigned compliance Officer
     * @param _newComplianceOfficer The new compliance officer of the contract
     */
    function changeOfficer(address _newComplianceOfficer) onlyComplianceOfficer public {
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