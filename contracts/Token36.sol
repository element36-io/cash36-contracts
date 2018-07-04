pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "./Initializable.sol";
import "./Controlled.sol";
import "./IToken36Controller.sol";
import "./WithFees.sol";


/// @title Token36 Base Contract
/// @author element36.io
contract Token36 is ERC20, Initializable, Controlled, WithFees {

    string public name;
    string public symbol;
    uint8 public constant DECIMALS = 18;

    // Stores the balances in history
    struct Checkpoint {
        uint128 fromBlock;
        uint128 value;
    }

    // Tracks the balances of token holders incl. history of it
    mapping (address => Checkpoint[]) balances;

    // Tracks any extra transfer rights as in all ERC20 tokens
    mapping (address => mapping (address => uint256)) allowed;

    // Tracks the history of the totalSupply of the token
    Checkpoint[] totalSupplyHistory;

    // Flag to determine if the token is transferable or not.
    bool public transfersEnabled;

    event Burn(address indexed burner, uint256 value);

    // Constructor
    constructor(string _name, string _symbol) public {
        initialized();
        name = _name;
        symbol = _symbol;
        transfersEnabled = true;
        feeCollector = msg.sender;
    }

    /**
     * @notice Send _amount tokens to _to from msg.sender
     * @param _to The address of the recipient
     * @param _amount The amount of tokens to be transferred
     * @return {
            bool: Whether the transfer was successful or not
        }
     */
    function transfer(address _to, uint256 _amount) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");
        return doTransfer(msg.sender, _to, _amount);
    }

    /**
     * @notice Send _amount tokens to _to from _from on the condition it is approved by _from
     * @param _from The address holding the tokens being transferred
     * @param _to The address of the recipient
     * @param _amount The amount of tokens to be transferred
     * @return {
            bool: True if the transfer was successful
        }
     */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");

        // The controller of this contract can move tokens around at will
        if (msg.sender != controller) {
            // The standard ERC 20 transferFrom functionality
            if (allowed[_from][msg.sender] < _amount) {
                return false;
            }

            allowed[_from][msg.sender] -= _amount;
        }
        return doTransfer(_from, _to, _amount);
    }

    /**
     * @dev This is the actual transfer function in the token contract, it can only be called from this contract.
     * @param _from The address holding the tokens being transferred
     * @param _to The address of the recipient
     * @param _amount The amount of tokens to be transferred
     * @return True if the transfer was successful
     */
    function doTransfer(address _from, address _to, uint _amount) internal returns(bool) {
        if (_amount == 0) {
            return true;
        }

        // Do not allow transfer to 0x0 or the token contract itself
        require((_to != 0) && (_to != address(this)), "_to address not allowed");

        // If the amount being transfered is more than the balance of the
        // account the transfer returns false
        uint previousBalanceFrom = balanceOfAt(_from, block.number);
        if (previousBalanceFrom < _amount) {
            return false;
        }

        // Alerts the token controller of the transfer
        if (isContract(controller)) {
            require(IToken36Controller(controller).onTransfer(_from, _to, _amount) == true,
                "Token36Controller rejected the transfer");
        }

        updateValueAtNow(balances[_from], previousBalanceFrom - _amount);
        uint previousBalanceTo = balanceOfAt(_to, block.number);
        require(previousBalanceTo + _amount >= previousBalanceTo); // Check for overflow
        updateValueAtNow(balances[_to], previousBalanceTo + _amount);

        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @notice Returns the current balance of given address
     * @param _owner The address that's balance is being requested
     * @return The balance of `_owner` at the current block
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balanceOfAt(_owner, block.number);
    }

    /**
     * @notice msg.sender approves _spender to spend _amount tokens on its behalf
     * @param _spender The address of the account able to transfer the tokens
     * @param _amount The amount of tokens to be approved for transfer
     * @return True if the approval was successful
     */
    function approve(address _spender, uint256 _amount) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");

        // To change the approve amount you first have to reduce the addresses`
        //  allowance to zero by calling `approve(_spender,0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require((_amount == 0) || (allowed[msg.sender][_spender] == 0), "please reset approve amount to 0 first");

        allowed[msg.sender][_spender] = _amount;

        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /// @notice Enables token holders to transfer their tokens freely if true
    /// @param _transfersEnabled True if transfers are allowed in the clone
    function enableTransfers(bool _transfersEnabled) public onlyController {
        transfersEnabled = _transfersEnabled;
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(uint256 _value) public {
        uint previousBalanceFrom = balanceOfAt(msg.sender, block.number);
        require(_value <= previousBalanceFrom);

        // Calc and deduct fee
        uint256 fee = calcFee(_value);
        uint256 remainingValue = _value - fee;

        // Transfer fee amount to us
        uint previousBalanceFee = balanceOfAt(feeCollector, block.number);
        updateValueAtNow(balances[feeCollector], previousBalanceFee + fee);

        // Now burn the rest
        updateValueAtNow(balances[msg.sender], previousBalanceFrom - _value);
        uint curTotalSupply = totalSupply();
        updateValueAtNow(totalSupplyHistory, curTotalSupply - remainingValue);

        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
    }

    /// @notice Generates `_amount` tokens that are assigned to `_owner`
    /// @param _owner The address that will be assigned the new tokens
    /// @param _amount The quantity of tokens generated
    /// @return True if the tokens are generated correctly
    function mintTokens(address _owner, uint _amount) onlyController public returns (bool) {
        uint curTotalSupply = totalSupply();
        require(curTotalSupply + _amount >= curTotalSupply); // Check for overflow
        uint previousBalanceTo = balanceOf(_owner);
        require(previousBalanceTo + _amount >= previousBalanceTo); // Check for overflow
        updateValueAtNow(totalSupplyHistory, curTotalSupply + _amount);
        updateValueAtNow(balances[_owner], previousBalanceTo + _amount);
        emit Transfer(0, _owner, _amount);
        return true;
    }

    /**
     * @notice This function makes it easy to read the `allowed[]` map
     * @param _owner The address of the account that owns the token
     * @param _spender The address of the account able to transfer the tokens
     * @return Amount of remaining tokens of _owner that _spender is allowed to spend
     */
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    /// @dev This function makes it easy to get the total number of tokens
    /// @return The total number of tokens
    function totalSupply() public view returns (uint) {
        return totalSupplyAt(block.number);
    }

    /// @dev Queries the balance of `_owner` at a specific `_blockNumber`
    /// @param _owner The address from which the balance will be retrieved
    /// @param _blockNumber The block number when the balance is queried
    /// @return The balance at `_blockNumber`
    function balanceOfAt(address _owner, uint _blockNumber) public view returns (uint) {
        return getValueAt(balances[_owner], _blockNumber);
    }

    /// @notice Total amount of tokens at a specific `_blockNumber`.
    /// @param _blockNumber The block number when the totalSupply is queried
    /// @return The total amount of tokens at `_blockNumber`
    function totalSupplyAt(uint _blockNumber) public view returns(uint) {
        return getValueAt(totalSupplyHistory, _blockNumber);
    }

    /// @dev `getValueAt` retrieves the number of tokens at a given block number
    /// @param checkpoints The history of values being queried
    /// @param _block The block number to retrieve the value at
    /// @return The number of tokens being queried
    function getValueAt(Checkpoint[] storage checkpoints, uint _block) view internal returns (uint) {
        if (checkpoints.length == 0) {
            return 0;
        }

        // Check for block number outside boundaries
        if (_block >= checkpoints[checkpoints.length-1].fromBlock) {
            return checkpoints[checkpoints.length-1].value;
        }
        if (_block < checkpoints[0].fromBlock) {
            return 0;
        }

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
    }

    /// @dev `updateValueAtNow` used to update the `balances` map and the
    ///  `totalSupplyHistory`
    /// @param checkpoints The history of data being updated
    /// @param _value The new number of tokens
    function updateValueAtNow(Checkpoint[] storage checkpoints, uint _value) internal {
        if ((checkpoints.length == 0) || (checkpoints[checkpoints.length - 1].fromBlock < block.number)) {
            Checkpoint storage newCheckPoint = checkpoints[checkpoints.length++];
            newCheckPoint.fromBlock = uint128(block.number);
            newCheckPoint.value = uint128(_value);
        } else {
            Checkpoint storage oldCheckPoint = checkpoints[checkpoints.length - 1];
            oldCheckPoint.value = uint128(_value);
        }
    }

    /// @dev Internal function to determine if an address is a contract
    /// @param _addr The address being queried
    /// @return True if `_addr` is a contract
    function isContract(address _addr) internal view returns(bool) {
        uint size;
        if (_addr == 0)
            return false;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }

    /// @dev Helper function to return a min betwen the two uints
    function min(uint a, uint b) internal pure returns (uint) {
        return a < b ? a : b;
    }

    /// @notice The fallback function: If the contract's controller has not been
    ///  set to 0, then the `proxyPayment` method is called which relays the
    ///  ether and creates tokens as described in the token controller contract
    function () payable public {
        revert();
    }
}
