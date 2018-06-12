pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token36.sol";
import "./Token36Controller.sol";


/// @title Cash36 Index Contract
/// @author element36.io
contract Cash36 is Ownable {

    // Token Storage
    address[] tokens;
    mapping(string => bool) registeredSymbol;
    mapping(string => uint256) tokenIndexBySymbol;
    mapping(address => address) tokenControllerByTokenAddress;

    // Whitelisted Exchanges
    mapping(address => bool) allowedExchanges;

    modifier onlyAllowedExchanges {
        require(allowedExchanges[msg.sender]);
        _;
    }

    // Event
    event TokenCreated(string _name, string _symbol, address tokenAddress, address tokenControllerAddress);

    /**
     * @notice Create a new Token36
     * @dev Also creates a token controller with given KYC Provider (Calls Event TokenCreated on success)
     * @param _name Name of the token (as with ERC20)
     * @param _symbol Symbol of the token (as with ERC20)
     * @param _kycProvider Address of the KYC Provider contract
     */
    function createNewToken(string _name, string _symbol, address _kycProvider) external onlyAllowedExchanges {
        require(keccak256(_name) != keccak256(""));
        require(keccak256(_symbol) != keccak256(""));
        require(registeredSymbol[_symbol] == false);
        require(isContract(_kycProvider));

        Token36 newToken = new Token36(_name, _symbol);

        tokenIndexBySymbol[_symbol] = tokens.length;
        tokens.push(newToken);
        registeredSymbol[_symbol] = true;

        Token36Controller newController = new Token36Controller(newToken, _kycProvider);
        tokenControllerByTokenAddress[newToken] = address(newController);

        // Transfer Ownership of controller to Exchange who creates the Token
        newController.transferOwnership(msg.sender);

        // Set new Controller as token controller
        newToken.changeController(address(newController));

        emit TokenCreated(_name, _symbol, address(newToken), address(newController));
    }

    /**
      @notice Get all Cash36 Tokens
      @return address array of all cash36 tokens
    */
    function getTokens() external view returns (address[]) {
        return tokens;
    }

    /**
      @notice Check if token with given symbl is a registered cash36 token
      @param _symbol Symbol of the Token to be checked
      @return bool true if token is a registered and active cash36 token
    */
    function isCash36Token(string _symbol) external view returns (bool) {
        return registeredSymbol[_symbol];
    }

    /**
      @notice Get the Token address by symbol
      @param _symbol Symbol of the Token
    */
    function getTokenBySymbol(string _symbol) external view returns (address) {
        require(registeredSymbol[_symbol]);
        address tokenAddress = tokens[tokenIndexBySymbol[_symbol]];

        return tokenAddress;
    }

    /**
      @notice Get the TokenController address
      @param _tokenAddress Address of the Token
    */
    function getTokenController(address _tokenAddress) external view onlyAllowedExchanges returns (address) {
        return tokenControllerByTokenAddress[_tokenAddress];
    }

    /**
      @notice Add an exchange to the whitelist
      @param _exchange Address of the exchange
    */
    function addExchange(address _exchange) external onlyOwner {
        require(isContract(_exchange) == false);
        allowedExchanges[_exchange] = true;
    }

    /**
      @notice Remove an exchange from the whitelist
      @param _exchange Address of the exchange
    */
    function removeExchange(address _exchange) external onlyOwner {
        allowedExchanges[_exchange] = false;
    }

    /**
      @notice Check if an exchange is on the whitelist
      @param _exchange Address of the exchange
    */
    function isAllowedExchange(address _exchange) external view returns (bool) {
        return allowedExchanges[_exchange];
    }

    /// INTERNAL
    function isContract(address _address) internal view returns(bool) {
        uint size;
        if (_address == 0) {
            return false;
        }
        assembly {
            size := extcodesize(_address)
        }
        return size > 0;
    }
}