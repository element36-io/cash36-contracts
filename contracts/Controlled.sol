pragma solidity ^0.4.24;


/// @title Interface
/// @author element36.io
contract Controlled {

    // Address of the controller
    address public controller;

    /// @notice Allow only controller address to access
    modifier onlyController {
        require(msg.sender == controller);
        _;
    }

    // Constructor
    constructor()  public {
        controller = msg.sender;
    }

    /// @notice Changes the controller of the contract
    /// @param _newController The new controller of the contract
    function changeController(address _newController) onlyController public {
        controller = _newController;
    }
}