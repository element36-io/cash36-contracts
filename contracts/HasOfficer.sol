pragma solidity ^0.4.24;


/// @title Interface
/// @author element36.io
contract HasOfficer {

    // Address of the controller
    address public complianceOfficer;

    /// @notice Allow only controller address to access
    modifier onlyComplianceOfficer {
        require(msg.sender == complianceOfficer);
        _;
    }

    // Constructor
    constructor() public {
        complianceOfficer = msg.sender;
    }

    /// @notice Changes the ComplianceOfficer of the contract
    /// @param _newComplianceOfficer The new compliance officer of the contract
    function changeOfficer(address _newComplianceOfficer) onlyComplianceOfficer public {
        complianceOfficer = _newComplianceOfficer;
    }

    function isOfficer(address _addressToCheck) public view returns (bool){
        return complianceOfficer == _addressToCheck;
    }
}