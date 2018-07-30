pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IToken36Controller.sol";
import "./Token36.sol";
import "./Cash36Compliance.sol";


/// @title Token Controller
/// @author element36.io
contract Token36Controller is IToken36Controller, Ownable {
    using SafeMath for uint256;

    // Token controlled by this controller
    Token36 internal token;

    // Compliance contract
    Cash36Compliance internal compliance;

    // Max. Tokens an account can hold
    uint256 public maxAccountTokens = uint256(-1);

    modifier onlyAllowedExchanges {
        require(compliance.isAllowedExchange(msg.sender, address(token)));
        _;
    }

    function onTransfer(address _from, address _to, uint _amount) public view returns (bool) {
        require(msg.sender == address(token));

        // Check Compliance, unless receiving address is a contract
        if (isContract(_to) == false) {
            // Check if max balance is reached
            if (!isBalanceIncreaseAllowed(_to, _amount)) {
                return false;
            }

            // Check if user _to is KYCed
            if (!compliance.checkUser(_to)) {
                return false;
            }

            // Check if user _to is KYCed
            if (!compliance.checkUserLimit(_to, _amount, token.balanceOf(_to))) {
                return false;
            }

            // Check if user _from is KYCed (blacklist check)
            if (!compliance.checkUser(_from)) {
                return false;
            }

            // Check if user _to is KYCed
            if (!compliance.checkUserLimit(_from, _amount, token.balanceOf(_from))) {
                return false;
            }
        }

        return true;
    }

    function mint(address _receiver, uint256 _amount) external onlyAllowedExchanges {
        // Check Compliance first
        if (isContract(_receiver) == false) {
            require(compliance.checkUser(_receiver));
        }

        token.mintTokens(_receiver, _amount);
    }

    function setMaxAccountTokens(uint _maxAccountTokens) external onlyAllowedExchanges {
        maxAccountTokens = _maxAccountTokens;
    }

    function updateComplianceContract(address _newComplianceContract) external onlyOwner {
        compliance = Cash36Compliance(_newComplianceContract);
    }

    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        token.enableTransfers(_transfersEnabled);
    }

    function changeController(address _newController) external onlyOwner {
        token.changeController(_newController);
    }

    // INTERNAL
    function isBalanceIncreaseAllowed(address _receiver, uint _amount) internal view returns (bool) {
        return token.balanceOf(_receiver).add(_amount) <= maxAccountTokens;
    }

    function isContract(address _addr) view internal returns(bool) {
        uint size;
        if (_addr == 0)
            return false;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }
}