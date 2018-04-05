pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/StandardToken.sol";


/// @title EUR36 Contract
/// @author element36.io
contract EUR36 is StandardToken, Controlled {

    Controlled tokenController;

    string public constant NAME = "EUR36 Token";
    string public constant SYMBOL = "EUR36";
    uint8 public constant DECIMALS = 18;

    uint256 public constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(DECIMALS));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    function EUR36() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

    /**
     * @dev Transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(tokenController.onTransfer(msg.sender, -to));

        super.transfer(_to, _value);

        Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(tokenController.onTransfer(msg.sender, -to));

        super.transferFrom(_from, _to, _value);

        return true;
    }
}