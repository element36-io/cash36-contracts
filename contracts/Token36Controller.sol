pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";
import "./IToken36Controller.sol";
import "./Token36.sol";
import "./Cash36Compliance.sol";
import "./Cash36Exchanges.sol";


/// @title Token Controller
/// @author element36.io
contract Token36Controller is IToken36Controller, Ownable {

    // Token controlled by this controller
    Token36 internal token;

    // Compliance contract
    Cash36Compliance internal compliance;

    // Exchanges contract
    Cash36Exchanges internal exchanges;

    modifier onlyAllowedExchanges {
        require(exchanges.isAllowedExchange(msg.sender, address(token)));
        _;
    }

    /**
    */
    function onTransfer(address _from, address _to, uint _amount) public view returns (bool) {
        // Only the Token itself can call this
        require(msg.sender == address(token));

        // Check Compliance, unless receiving address is a contract
        if (Address.isContract(_to) == false && _to != address(0)) {
            // Check if user _to is KYCed and not blacklisted
            if (!compliance.checkUser(_to)) {
                return false;
            }

            // Check if user _to is within limits
            if (!compliance.checkUserLimit(_to, _amount, token.balanceOf(_to))) {
                return false;
            }
        }

        if (Address.isContract(_from) == false && _from != address(0)) {
            // Check if user _from is KYCed and not blacklisted
            if (!compliance.checkUser(_from)) {
                return false;
            }

            // Check if user _from within limits
            if (!compliance.checkUserLimit(_from, _amount, token.balanceOf(_from))) {
                return false;
            }
        }

        return true;
    }

    function mint(address _receiver, uint256 _amount) external onlyAllowedExchanges {
        // Check Compliance first
        if (Address.isContract(_receiver) == false) {
            require(compliance.checkUser(_receiver));
            require(compliance.checkUserLimit(_receiver, _amount, token.balanceOf(_receiver)));
        }

        token.mint(_receiver, _amount);
    }

    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        if (_transfersEnabled == true) {
            token.unpause();
        } else {
            token.pause();
        }
    }

    function getComplianceContract() external view onlyOwner returns (address) {
        return address(compliance);
    }

    function updateComplianceContract(address _newComplianceContract) external onlyOwner {
        compliance = Cash36Compliance(_newComplianceContract);
    }

    function getExchangesContract() external view onlyOwner returns (address) {
        return address(exchanges);
    }

    function updateExchangesContract(address _newExchangesContract) external onlyOwner {
        exchanges = Cash36Exchanges(_newExchangesContract);
    }

    function changeController(address _newController) external onlyOwner {
        token.changeController(_newController);
    }
}