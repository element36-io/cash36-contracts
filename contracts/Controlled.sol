pragma solidity ^0.5.9;


/// @title Cash36 Interface holding the Token Controller
/// @author element36.io
contract Controlled {

    // Address of the controller
    address internal _controller;

    // Allow only controller address to access
    modifier onlyController {
        require(msg.sender == _controller, "access not allowed, only controller");
        _;
    }

    // Constructor
    constructor() public {
        _controller = msg.sender;
    }

    function controller() public view returns (address){
        return _controller;
    }

    /**
     * @notice Changes the controller of the contract
     * @dev onlyController - only open to the currently assigned controller
     * @param _newController The new controller of the contract
     */
    function changeController(address _newController) public onlyController {
        _controller = _newController;
    }
}