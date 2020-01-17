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
    modifier onlyExchangesOrOfficers {
        require(exchanges.isAllowedExchange(msg.sender, address(token)) || compliance.isOfficer(msg.sender), "sender not registered");
        _;
    }


    /**
    * @notice Controller Hook called in Token on transfer. Has no _to because this fx is used in a wallet-free context
    * @notice Does all required compliance checks and only allows the transfer if user passes them all.
    * @param _from Sender account address
    * @param _amount Amount
    */
    function onTransfer(address _from, uint _amount) public view returns (bool) {
        // Only the Token itself can call this - msg.sender is not the "_from" value but the calling contract
        require(msg.sender == address(token), "Only callable from controlled Token");

        // Check Compliance, unless sending address is a contract
        if (Address.isContract(_from) == false || compliance.isCompany(_from)) {
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
    * @notice Controller Hook called in controlled Token on every transfer.
    * @notice Does all required compliance checks and only allows the transfer if user passes them all.
    * @param _from Sender account address
    * @param _to Recipient accounts address
    * @param _amount Amount
    */
    function onTransfer(address _from, address _to, uint _amount) public view returns (bool) {
        // Only the Token itself can call this - msg.sender is not the "_from" value but the calling contract
        require(msg.sender == address(token), "Only callable from controlled Token");

        // Check Compliance, unless receiving address is a contract
        if (Address.isContract(_to) == false || compliance.isCompany(_to)) {
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

        // Check Compliance, unless sending address is a contract
        if (Address.isContract(_from) == false || compliance.isCompany(_from)) {
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
    * @notice Controller Hook called in controlled Token on every burn.
    * @notice Does all required compliance checks and only allows the burn if user passes them all.
    * @param _from Sender account address
    */
    function onBurn(address _from) public view returns (bool) {
        // Only the Token itself can call this
        require(msg.sender == address(token), "Only callable from controlled Token");

        // Check Compliance first
        // If contract, we are fine - Contracts cannot cash out directly.
        if (Address.isContract(_from) == true) return true;

        // Exceptions for contracts, compliacne officers and registered companies.
        if (Address.isContract(_from) == false || compliance.isCompany(_from) || compliance.isOfficer(_from) == false) {
            if (!compliance.checkUser(_from)) {
                return false;
            }
            if (!compliance.hasAttribute(_from, "ATTR_SELL")) {
                return false;
            }
        }

        return true;
    }

    /**
    * @notice Mints new tokens for given account address
    * @dev onlyAllowedExchanges - only open to white listed exchange accounts
    * @param _receiver Recipient account address
    * @param _amount Amount to mint
    */
    function mint(address _receiver, uint256 _amount) external onlyExchangesOrOfficers {
        token.mint(_receiver, _amount);
    }

    /**
    * @notice Burn tokens for given account address
    * @dev onlyAllowedExchanges - only open to white listed exchange accounts
    * @param _from Account address from which tokens are burnt
    * @param _amount Amount to burn
    */

    function burn(address _from, uint256 _amount) external onlyExchangesOrOfficers {
        token.burnFrom(_from, _amount);
    }

    /**
    * @notice Enables or disables the token globally
    * @dev onlyOwner - only open to element36 Account
    * @param _transfersEnabled true to enable, false to disable
    */
    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        if (_transfersEnabled == true) {
            token.unpause();
        } else {
            token.pause();
        }
    }

    /**
    * @notice Set a new Cap for the Token
    * @dev onlyOwner - only open to element36 Account
    * @param _cap New value for token cap
    */
    function updateCap(uint256 _cap) external onlyOwner {
        token.updateCap(_cap);
    }

    /**
    * @notice Get address of current compliance contract
    * @dev onlyOwner - only open to element36 Account
    */
    function getComplianceContract() external view onlyOwner returns (address) {
        return address(compliance);
    }

    /**
    * @notice Update to a new compliance contract
    * @dev onlyOwner - only open to element36 Account
    * @param _newComplianceContract New Compliance contract address
    */
    function updateComplianceContract(address _newComplianceContract) external onlyOwner {
        compliance = Cash36Compliance(_newComplianceContract);
    }

    /**
    * @notice Get address of current exchanges contract
    * @dev onlyOwner - only open to element36 Account
    */
    function getExchangesContract() external view onlyOwner returns (address) {
        return address(exchanges);
    }

    /**
    * @notice Update to a new exchanges contract
    * @dev onlyOwner - only open to element36 Account
    * @param _newExchangesContract New Exchange contracts address
    */
    function updateExchangesContract(address _newExchangesContract) external onlyOwner {
        exchanges = Cash36Exchanges(_newExchangesContract);
    }

    /**
    * @notice Change to a new controller address
    * @dev onlyOwner - only open to element36 Account
    * @param _newController New controller Address
    */
    function changeController(address _newController) external onlyOwner {
        token.changeController(_newController);
    }
}