pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/StandardToken.sol";


/// @title CHFT Contract
/// @author element36.io
contract CHF36 is StandardToken {

    string public constant NAME = "CHF36 Token";
    string public constant SYMBOL = "CHF36";
    uint8 public constant DECIMALS = 18;

    uint256 public constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(DECIMALS));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    function CHF36() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}