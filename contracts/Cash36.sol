pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token36.sol";
import "./Token36Controller.sol";


/// @title Cash36 Main Index Contract
/// @notice Main Contract of cash36. Acts as an Index to keep track of all official cash36 token contracts and more.
/// @author element36.io
contract Cash36 is Ownable {

    // Token Storage
    address[] tokens;
    mapping(string => bool) registeredSymbol;
    mapping(string => uint256) tokenIndexBySymbol;

    /**
     * @notice Registers a new token for the cash36 System
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token
     * @param _tokenAddress Address of the token
     */
    function registerToken(string _symbol, address _tokenAddress) external onlyOwner {
        tokenIndexBySymbol[_symbol] = tokens.length;
        tokens.push(_tokenAddress);
        registeredSymbol[_symbol] = true;
    }

    /**
     * @notice Get all Cash36 Tokens
     * @return Array of addresses of all Cash36 Tokens
     */
    function getTokens() external view returns (address[]) {
        return tokens;
    }

    /**
     * @notice Get the Token address by symbol
     * @param _symbol Symbol of the Token
     * @return {
     *   address: Address of the Cash36 Token
     * }
     */
    function getTokenBySymbol(string _symbol) external view returns (address) {
        require(registeredSymbol[_symbol]);
        address tokenAddress = tokens[tokenIndexBySymbol[_symbol]];

        return tokenAddress;
    }

    /**
     * @notice Check if a Token with given symbol is a registered Cash36 Token
     * @param _symbol Symbol of the Token to be checked
     * @return {
     *   bool: True when Token is a registered and active Cash36 Token
     * }
     */
    function isCash36Token(string _symbol) external view returns (bool) {
        return registeredSymbol[_symbol];
    }

    /**
     * @notice Admin function to get the max amount of tokens an account can hold
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be checked
     * @return {
     *   uint256: Max amount of tokens an account can hold
     * }
     */
    function getMaxAccountTokens(string _symbol) external view returns (uint256) {
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        return controller.getMaxAccountTokens();
    }

    /**
     * @notice Admin function to update the max amount of tokens, an account can hold
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be checked
     * @param _value New value for max account tokens
     */
    function setMaxAccountTokens(string _symbol, uint256 _value) external {
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.setMaxAccountTokens(_value);
    }

    /**
     * @notice Check if a Token with given symbol is a registered Cash36 Token
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be checked
     * @return {
     *   bool: True when Token is a registered and active Cash36 Token
     * }
     */
    function getCompliance(string _symbol) external view returns (address) {
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        return controller.getComplianceContract();
    }

    /**
     * @notice Admin function to update to a new ComplianceContract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be updated
     * @param _newComplianceAddress Address of the new Compliance contract
     */
    function updateCompliance(string _symbol, address _newComplianceAddress) external onlyOwner {
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.updateComplianceContract(_newComplianceAddress);
    }

    /**
     * @notice Admin function to update to a new ControllerContract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be updated
     * @param _newControllerAddress Address of the new Controller contract
     */
    function updateController(string _symbol, address _newControllerAddress) external onlyOwner {
        Token36(tokens[tokenIndexBySymbol[_symbol]]).changeController(_newControllerAddress);
    }

    /**
     * @notice Admin function to enable/disable Token transfer
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be enabled/disabled
     * @param _transfersEnabled Pass 'true' to enable, 'false' to disable
     */
    function enableTransfers(string _symbol, bool _transfersEnabled) external onlyOwner {
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.enableTransfers(_transfersEnabled);
    }
}