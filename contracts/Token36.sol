pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Controlled.sol";
import "./IToken36Controller.sol";
import "./Initializable.sol";


/// @title Token36 Base Contract
/// @author element36.io
contract Token36 is ERC20Detailed, Initializable, Pausable, Controlled {
    using SafeMath for uint256;

    // User balances
    mapping (address => uint256) private _balances;

    // User allowances
    mapping (address => mapping (address => uint256)) private _allowed;

    // Total supply of token
    uint256 private _totalSupply;

    // Max amount of tokens allowed
    uint256 private _cap;

    // Burn Event
    event Burn(address indexed burner, uint256 value);

    // Wallet free Transfer Event which is picked up by the server
    event InitiateTransfer(address indexed from, bytes32 indexed transactionHash, uint256 amount);


    // Constructor
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 cap) public ERC20Detailed(name, symbol, decimals) {

        require(cap > 0, "cap cannot be 0");

        initialized();

        // Set initial cap
        _cap = cap;
    }

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
   * @dev Returns the cap on the token's total supply.
   */
    function cap() public view returns (uint256) {
        return _cap;
    }

    /**
     * @dev Set a new cap for the token
     * @param newCap The new cap for the token
     */
    function updateCap(uint256 newCap) public onlyController {
        _cap = newCap;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
     * @dev Transfer token to a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value) public whenNotPaused returns (bool) {
        require(IToken36Controller(_controller).onTransfer(msg.sender, to, value) == true, "Token36Controller rejected the transfer");

        _transfer(msg.sender, to, value);
        return true;
    }


    /**
     * @dev Inititate transfer tokens or funds to  based on  hash of a transaction (DATA, 32 Bytes - hash of a transaction)
     * The idea is following scenario/use case: User Alice has no wallet. Alice uses Cash36 to do a bank-payment to Bob -
     * means that  Cash36 will send funds (Cash36 Tokens) to Bob. If Bob wants to send funds back to Alice (e.g. for yield-payment),
     * Then Bob has no wallet address of Alice. Bob uses the transaction-Id from the initial payment as a clue to refer to Alice and trigger a
     * transfer of his funds (tokens) to Alice.
     * @param identityClue As identity clue the hash of the transaction which holds to the identity of the receiver. Will be evaluated on the server side.
     * @param value The amount to be transferred.
     */
    function transferClue(bytes32 identityClue, uint256 value) public whenNotPaused returns (bool) {
        require(IToken36Controller(_controller).onTransfer(msg.sender, value) == true, "Token36Controller rejected txn");
        // issue payment
        //msg sender is a contract
        _burn(msg.sender,value);
        emit InitiateTransfer(msg.sender,identityClue,value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public whenNotPaused returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another.
     * Note that while this function emits an Approval event, this is not required as per the specification,
     * and other compliant implementations may not emit the event.
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address from, address to, uint256 value) public whenNotPaused returns (bool) {
        require(IToken36Controller(_controller).onTransfer(from, to, value) == true, "Token36Controller rejected txn");

        // The controller of this contract can move tokens around at will - needed for recovery
        if (msg.sender != _controller) {
            _transfer(from, to, value);
            _approve(from, msg.sender, _allowed[from][msg.sender].sub(value));
        } else {
            _transfer(from, to, value);
        }
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when _allowed[msg.sender][spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address spender, uint256 addedValue) public whenNotPaused returns (bool) {
        _approve(msg.sender, spender, _allowed[msg.sender][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when _allowed[msg.sender][spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public whenNotPaused returns (bool) {
        _approve(msg.sender, spender, _allowed[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "address 0 not allowed");

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public onlyController whenNotPaused returns (bool) {
        _mint(to, value);
        return true;
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of balances such that the
     * proper events are emitted.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal {
        require(account != address(0), "address 0 not allowed");
        require(totalSupply().add(value) <= _cap, "token cap exceeded");

        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See `ERC20._burn`.
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev See `ERC20._burnFrom`.
     */
    function burnFrom(address account, uint256 amount) public {
        _burnFrom(account, amount);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address account, uint256 value) internal {
        require(account != address(0), "address 0 not allowed");
        require(IToken36Controller(_controller).onBurn(account) == true, "Token36Controller rejected the burn");

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);

        // Burn Event needed for element36 Exchange
        emit Burn(account, value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account, deducting from the sender's allowance for said account. Uses the
     * internal burn function.
     * Emits an Approval event (reflecting the reduced allowance).
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burnFrom(address account, uint256 value) internal {
        require(account != address(0), "address 0 not allowed");
        require(IToken36Controller(_controller).onBurn(account) == true, "Token36Controller rejected the burn");

        if (msg.sender != _controller) {
            _burn(account, value);
            _approve(account, msg.sender, _allowed[account][msg.sender].sub(value));
        } else {  // The controller of this contract can burn tokens at will - needed for recovery
            _burn(account, value);
        }
    }

    /**
     * @dev Approve an address to spend another addresses' tokens.
     * @param owner The address that owns the tokens.
     * @param spender The address that will spend the tokens.
     * @param value The number of tokens that can be spent.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        require(spender != address(0), "address 0 not allowed");
        require(owner != address(0), "address 0 not allowed");

        _allowed[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
}