pragma solidity ^0.5.9;

import "./Token36.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/TokenTimelock.sol

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens anytime.
 *
 * For a more complete vesting schedule, see {TokenVesting}.
 */
contract Ping {
    using SafeERC20 for Token36;
    using SafeERC20 for Token36;

    // ERC20 basic token contract being held
    Token36 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;


    // beneficiary of tokens after they are released
    address private _pingSender;

    /**
    * We dont want any eth
     */
    function () external payable {
        revert("no eth accepted");
    }

    constructor(Token36 token) public {
        _token = token;
    }

    /**
    * Load the contract with tokens for a beneficiary (or to be stolen with steal-function)
     */
    function ping(address beneficiary, uint256 value)  public  {
        require ((0 < value && value <= 200*1e18)," 0<tokens<=200");
        uint256 balance = _token.balanceOf(address(this));
        require(balance == 0, "ping occupied - use pong or steal first");
        _pingSender = msg.sender;
        _token.safeTransferFrom(msg.sender,address(this),value);
        _beneficiary = beneficiary;
    }

 /**
    * Load the contract with tokens for a beneficiary (or to be stolen with steal-function)
     */
    function pongWalletFree(bytes32 clue,uint256 amount)  public  {
        require(_beneficiary == address(0), "beneficiary registered");
        uint256 balance = _token.balanceOf(address(this));
        require(0 < balance, "no balance");
        require(balance >= amount, "too little balance");
        _token.transferClue(clue, amount);
        //_token.burn(amount);
    }


    /**
     * @notice Transfers tokens to beneficiary - cash36 will check KYC
     */
    function pong() public {
        uint256 amount = _token.balanceOf(address(this));
        require(amount > 0, "ping 0 tokens here");
        require(_beneficiary != address(0), "no beneficiary registered");
        _token.safeTransfer(_beneficiary, amount);
        _beneficiary = address(0);
    }


    /**
     * @notice Transfers tokens to the caller - remark: Cash36 contract will check validate KYC
     */
    function steal() public {
        uint256 amount = _token.balanceOf(address(this));
        require(amount > 0, "no tokens to release");
        _beneficiary = address(0);
        _token.safeTransfer(msg.sender, amount);
    }

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view returns (address) {
        return _beneficiary;
    }
}