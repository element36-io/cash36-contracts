pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/// @title Cash36 Exchanges Contract
/// @notice Is responsible for keeping track of all allowed Exchanges.
/// @author element36.io
contract Cash36Exchanges is Ownable {

    // Whitelisted Exchanges per token
    mapping(address => address[]) private allExchanges;
    mapping(address => mapping(address => bool)) private allowedExchanges;

    /**
     * @notice Add an exchange to the list of accepted Exchanges
     * @dev Exchange can not be another Smart Contract
     * @dev onlyOwner - only open to element36 Account
     * @param _exchange Address of the exchange
     */
    function addExchange(address _exchange, address _token) external onlyOwner {
        allExchanges[_token].push(_exchange);
        allowedExchanges[_token][_exchange] = true;
    }

    /**
     * @notice Remove an exchange from the list of accepted Exchanges
     * @dev onlyOwner - only open to element36 Account
     * @param _exchange Address of the exchange
     */
    function removeExchange(address _exchange, address _token) external onlyOwner {
        allowedExchanges[_token][_exchange] = false;
    }

    /**
     * @notice Check if an exchange is on the list of accepted Exchanges
     * @param _exchange Address of the exchange
     * @return {
     *   "bool": "True when Exchange is listed"
     * }
     */
    function isAllowedExchange(address _exchange, address _token) external view returns (bool) {
        return allowedExchanges[_token][_exchange];
    }

    /**
     * @notice Returns all registered exchange addresses for a given token address.
     * @dev Note: Due to limitations of solidity, this method returns the full list of every address ever registered.
     * @dev It does not consider exchanges, which might have been flagged false afterwards.
     * @dev Therefore to be sure, an additional call to isAllowedExchange, would be necessary.
     * @param _token Address of the token
     * @return {
     *   "address[]": List of address of exchanges
     * }
    */
    function getAllowedExchanges(address _token) external view returns (address[] memory) {
        return allExchanges[_token];
    }
}
