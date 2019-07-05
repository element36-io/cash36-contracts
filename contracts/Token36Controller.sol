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

    // Only Exchanges are allowed to handle certain functions
    modifier onlyAllowedExchanges {
        require(exchanges.isAllowedExchange(msg.sender, address(token)), "only registered exchanges allowed");
        _;
    }

    /**
    * @notice Hook called in controlled Token on every transfer.
    * @notice Does all required compliance checks and only allows the transfer if user passes all
    * @param _from Sender account address
    * @param _to Recipient accounts address
    * @param _amount Amount
    */
    function onTransfer(address _from, address _to, uint _amount) public view returns (bool) {
        // Only the Token itself can call this
        require(msg.sender == address(token), "Only callable from controlled Token");

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

            if (!compliance.hasAttribute(_to, "ATTR_RECEIVE")) {
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

            if (!compliance.hasAttribute(_from, "ATTR_SEND")) {
                return false;
            }
        }

        return true;
    }

    /**
    * @notice
    * @dev onlyAllowedExchanges - only open to white listed exchange accounts
    * @param _receiver Recipient account address
    * @param _amount Amount to mint
    */
    function mint(address _receiver, uint256 _amount) external onlyAllowedExchanges {
        // Check Compliance first
        if (Address.isContract(_receiver) == false) {
            require(compliance.checkUser(_receiver), "checkUser failed");
            require(compliance.checkUserLimit(_receiver, _amount, token.balanceOf(_receiver)), "amount > userLimit");
            require(compliance.hasAttribute(_receiver, "ATTR_BUY"), "user doesn't have attribute ATTR_BUY");
        }

        token.mint(_receiver, _amount);
    }

    /**
    * @notice
    * @dev onlyAllowedExchanges - only open to white listed exchange accounts
    * @param _receiver Recipient account address
    * @param _amount Amount to burn
    */
    function burn(address _receiver, uint256 _amount) external onlyAllowedExchanges {
        // Check Compliance first
        if (Address.isContract(_receiver) == false) {
            require(compliance.checkUser(_receiver), "checkUser failed");
            require(compliance.hasAttribute(_receiver, "ATTR_SELL"), "user doesn't have attribute ATTR_SELL");
        }

        token.burnFrom(_receiver, _amount);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    * @param _transfersEnabled true to enable, false to disable transfers
    */
    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        if (_transfersEnabled == true) {
            token.unpause();
        } else {
            token.pause();
        }
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    * @param _cap New value for token cap
    */
    function updateCap(uint256 _cap) external onlyOwner {
        token.updateCap(_cap);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    */
    function getComplianceContract() external view onlyOwner returns (address) {
        return address(compliance);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    * @param _newComplianceContract New Compliance contract address
    */
    function updateComplianceContract(address _newComplianceContract) external onlyOwner {
        compliance = Cash36Compliance(_newComplianceContract);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    */
    function getExchangesContract() external view onlyOwner returns (address) {
        return address(exchanges);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    * @param _newExchangesContract New Exchange contracts address
    */
    function updateExchangesContract(address _newExchangesContract) external onlyOwner {
        exchanges = Cash36Exchanges(_newExchangesContract);
    }

    /**
    * @notice
    * @dev onlyOwner - only open to element36 Account
    * @param _newController New controller Address
    */
    function changeController(address _newController) external onlyOwner {
        token.changeController(_newController);
    }
}