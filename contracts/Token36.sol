pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Initializable.sol";
import "./Controlled.sol";
import "./WithFees.sol";
import "./IToken36Controller.sol";


/// @title Token36 Base Contract
/// @author element36.io
contract Token36 is ERC20, Initializable, Controlled, WithFees {

    // ERC20 Fields
    string public name;
    string public symbol;
    uint8 public constant DECIMALS = 18;

    mapping(address => mapping(address => uint256)) internal allowed;
    mapping(address => uint256) balances;
    uint256 totalSupply_;

    // Flag to determine if the token is transferable or not.
    bool public transfersEnabled;

    // Events
    event Burn(address indexed burner, uint256 value);

    // Constructor
    constructor() public {
        initialized();
        transfersEnabled = true;
        feeCollector = msg.sender;
    }

    /**
    * @dev Gets the total supply of to
    * @return {
          bool: Whether the transfer was successful or not
      }
    */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the the balance of.
    * @return {
          bool: Whether the transfer was successful or not
      }
    */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    /**
     * @notice Send _amount tokens to _to from msg.sender
     * @param _to The address of the recipient
     * @param _value The amount of tokens to be transferred
     * @return {
            bool: Whether the transfer was successful or not
        }
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        if (_value == 0) {
            return true;
        }

        // Alerts the token controller of the transfer
        if (isContract(controller)) {
            require(IToken36Controller(controller).onTransfer(msg.sender, _to, _value) == true, "Token36Controller rejected the transfer");
        }

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @notice Send _amount tokens to _to from _from on the condition it is approved by _from
     * @param _from The address holding the tokens being transferred
     * @param _to The address of the recipient
     * @param _value The amount of tokens to be transferred
     * @return {
            bool: True if the transfer was successful
        }
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");
        require(_to != address(0));
        require(_value <= balances[_from]);

        if (_value == 0) {
            return true;
        }

        // Alerts the token controller of the transfer
        if (isContract(controller)) {
            require(IToken36Controller(controller).onTransfer(_from, _to, _value) == true, "Token36Controller rejected the transfer");
        }

        // The controller of this contract can move tokens around at will
        if (msg.sender != controller) {
            // The standard ERC 20 transferFrom functionality
            if (allowed[_from][msg.sender] < _value) {
                return false;
            }

            allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        }

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice msg.sender approves _spender to spend _amount tokens on its behalf
     * @param _spender The address of the account able to transfer the tokens
     * @param _value The amount of tokens to be approved for transfer
     * @return {
            bool: True if the approval was successful
        }
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(transfersEnabled, "transfers are disabled");

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return {
            uint256: Amount of tokens still available for the spender
        }
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     * @return {
            bool: True is successful
        }
     */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        require(transfersEnabled, "transfers are disabled");

        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     * @return {
            bool: True is successful
        }
     */
    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        require(transfersEnabled, "transfers are disabled");

        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @notice Enables token holders to transfer their tokens freely if true
     * @param _transfersEnabled True if transfers are allowed in the clone
     */
    function enableTransfers(bool _transfersEnabled) public onlyController {
        transfersEnabled = _transfersEnabled;
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(uint256 _value) public {
        require(_value <= balances[msg.sender]);

        // Calc and deduct fee
        uint256 fee = calcFee(_value);
        uint256 remainingValue = _value - fee;

        // Transfer fee amount to us
        balances[feeCollector] = balances[feeCollector].add(fee);

        // Now burn the rest
        balances[msg.sender] = balances[msg.sender].sub(_value);
        totalSupply_ = totalSupply_.sub(remainingValue);

        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
    }

    /**
     * @notice Generates `_amount` tokens that are assigned to `_owner`
     * @param _owner The address that will be assigned the new tokens
     * @param _value The quantity of tokens generated
     * @return {
            bool: True if the tokens are generated correctly
        }
     */
    function mintTokens(address _owner, uint _value) public onlyController returns (bool) {
        require(totalSupply_ + _value >= totalSupply_); // Check for overflow
        require(balances[_owner] + _value >= balances[_owner]); // Check for overflow

        balances[_owner] = balances[_owner].add(_value);
        totalSupply_ = totalSupply_.add(_value);

        emit Transfer(address(0), _owner, _value);
        return true;
    }

    /**
     * @dev Internal function to determine if an address is a contract
     * @param _addr The address being queried
     * @return {
            bool: True is addr is a contract
        }
     */
    function isContract(address _addr) internal view returns (bool) {
        uint size;
        if (_addr == 0)
            return false;

        assembly {
            size := extcodesize(_addr)
        }

        return size > 0;
    }

    /**
     * @notice The fallback function: If the contract's controller has not been
     * @notice set to 0, then the `proxyPayment` method is called which relays the
     * @notice ether and creates tokens as described in the token controller contract
     */
    function() payable public {
        revert();
    }
}
