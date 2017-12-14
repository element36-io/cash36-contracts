pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/token/StandardToken.sol";


/// @title CHFT Contract
/// @author element36.io
contract CHFT is StandardToken {

    string public constant NAME = "CHF Token";
    string public constant SYMBOL = "CHFT";
    uint8 public constant DECIMALS = 18;

    uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(DECIMALS));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    function CHFT() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}