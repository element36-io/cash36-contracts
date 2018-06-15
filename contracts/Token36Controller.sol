pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token36.sol";
import "./IToken36Controller.sol";
import "./Cash36KYC.sol";


/// @title
/// @author element36.io
contract Token36Controller is IToken36Controller {

    using SafeMath for uint256;

    Token36 public token;
    Cash36KYC kycProvider;

    // Returns all holders the token had.
    // Some of them can have a balance of 0.
    address[] public holders;
    mapping (address => bool) internal everHeld;

    // Blacklist, to disable certain user if needed
    mapping (address => bool) internal blacklist;

    uint256 public maxAccountTokens = uint256(-1);

    // Constructor
    function Token36Controller(Token36 _token, address _kycProvider) public {
        token = _token;
        kycProvider = Cash36KYC(_kycProvider);
    }

    function allHolders() public view returns (address[]) {
        return holders;
    }

    function isUserEnabled(address _user) public view returns(bool) {
        return !blacklist[_user];
    }

    function proxyPayment(address _owner) public payable returns(bool) {
        require(msg.sender == address(token));
        return false;
    }

    function onTransfer(address _from, address _to, uint _amount) public returns (bool) {
        require(msg.sender == address(token));

        // Check SimpleKYC
        if (isContract(_to) == false) {
            // Check if _from is on blacklist
            if (blacklist[_from]) {
                return false;
            }

            // Check if _to is on blacklist
            if (blacklist[_to]) {
                return false;
            }

            // Check if user is KYCed
            bool checkUser = kycProvider.checkUser(_to);
            if (!checkUser) {
                return false;
            }

            // Check if max balance is reached
            if (!isBalanceIncreaseAllowed(_to, _amount)) {
                return false;
            }
        }

        _logHolder(_to);

        return true;
    }

    function mint(address _receiver, uint256 _amount) external onlyOwner {
        // Check SimpleKYC
        if (isContract(_receiver) == false) {
            require(kycProvider.checkUser(_receiver));
        }

        token.generateTokens(_receiver, _amount);
        _logHolder(_receiver);
    }

    function burn(address _holder, uint256 _amount) external onlyOwner {
        token.destroyTokens(_holder, _amount);
    }

    function enableUser(address _user, bool _enabled) external onlyOwner {
        blacklist[_user] = !_enabled;
    }

    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        token.enableTransfers(_transfersEnabled);
    }

    function changeKycProvider(Cash36KYC _newProvider) external onlyOwner {
        kycProvider = _newProvider;
    }

    function setMaxAccountTokens(uint _maxAccountTokens) external onlyOwner {
        maxAccountTokens = _maxAccountTokens;
    }

    /// INTERNAL

    function _logHolder(address _newHolder) internal {
        if (everHeld[_newHolder]) {
            return;
        }

        everHeld[_newHolder] = true;
        holders.push(_newHolder);
    }

    function isContract(address _addr) constant internal returns(bool) {
        uint size;
        if (_addr == 0)
            return false;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }

    function isBalanceIncreaseAllowed(address _receiver, uint _amount) internal view returns (bool) {
        return token.balanceOf(_receiver).add(_amount) <= maxAccountTokens;
    }
}