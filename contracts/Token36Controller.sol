pragma solidity 0.4.21;

import "./Token36.sol";
import "./IToken36Controller.sol";
import "./SimpleKYC.sol";


/// @title
/// @author element36.io
contract Token36Controller is IToken36Controller {

    Token36 public token;
    SimpleKYC kycProvider;

    // Returns all holders the token had (since managing it).
    // Some of them can have a balance of 0.
    address[] public holders;
    mapping (address => bool) internal everHeld;

    // Constructor
    function Token36Controller(Token36 _token, address _kycProvider) public {
        token = _token;
        kycProvider = SimpleKYC(_kycProvider);
    }

    function allHolders() public view returns (address[]) {
        return holders;
    }

    function proxyPayment(address _owner) public payable returns(bool) {
        return true;
    }

    function onTransfer(address _from, address _to, uint _amount) public returns (bool) {
        // Check SimpleKYC
        if (isContract(_to) == false) {
            require(kycProvider.checkUser(_to));
        }

        _logHolder(_to);

        return true;
    }

    function onApprove(address _owner, address _spender, uint _amount) public returns(bool) {
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

    function enableTransfers(bool _transfersEnabled) external onlyOwner {
        token.enableTransfers(_transfersEnabled);
    }

    function changeKycProvider(SimpleKYC _newProvider) external onlyOwner {
        kycProvider = _newProvider;
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
}