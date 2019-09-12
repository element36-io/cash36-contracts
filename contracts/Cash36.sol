pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token36.sol";
import "./Token36Controller.sol";


/// @title Cash36 Main Index Contract
/// @notice Main Contract of cash36. Acts as an Index to keep track of all official cash36 token contracts and contains
///         major admin functions for the owner.
/// @author element36.io
contract Cash36 is Ownable {

    // Token Storage
    address[] private tokens;
    mapping(string => bool) private registeredSymbol;
    mapping(string => uint256) private tokenIndexBySymbol;

    /**
     * @notice Registers a new token for the cash36 System
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token
     * @param _tokenAddress Address of the token
     */
    function registerToken(string calldata _symbol, address _tokenAddress) external onlyOwner {
        require(!registeredSymbol[_symbol], "symbol already registered");
        tokenIndexBySymbol[_symbol] = tokens.length;
        tokens.push(_tokenAddress);
        registeredSymbol[_symbol] = true;
    }

    /**
     * @notice Get all Cash36 Tokens
     * @return Array of addresses of all Cash36 Tokens
     */
    function getTokens() public view returns (address[] memory) {
        return tokens;
    }

    /**
     * @notice Get the Token address by symbol
     * @param _symbol Symbol of the Token
     * @return {
     *   address: Address of the Cash36 Token
     * }
     */
    function getTokenBySymbol(string memory _symbol) public view returns (address) {
        require(registeredSymbol[_symbol], "not a registered symbol");
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
    function isCash36Token(string memory _symbol) public view returns (bool) {
        return registeredSymbol[_symbol];
    }

    /**
     * @notice Get address of compliance contract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token
     * @return {
     *   address: Address of compliance contract
     * }
     */
    function getCompliance(string calldata _symbol) external view returns (address) {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        return controller.getComplianceContract();
    }

    /**
     * @notice Admin function to update to a new ComplianceContract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be updated
     * @param _newComplianceAddress Address of the new Compliance contract
     */
    function updateCompliance(string calldata _symbol, address _newComplianceAddress) external onlyOwner {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.updateComplianceContract(_newComplianceAddress);
    }

    /**
     * @notice Get address of Exchanges contract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token
     * @return {
     *   address: Address of exchanges contract
     * }
     */
    function getExchangesContract(string calldata _symbol) external view returns (address) {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        return controller.getExchangesContract();
    }

    /**
     * @notice Admin function to update to a new ExchangesContract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be updated
     * @param _newExchangesAddress Address of the new Exchanges contract
     */
    function updateExchanges(string calldata _symbol, address _newExchangesAddress) external onlyOwner {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.updateExchangesContract(_newExchangesAddress);
    }

    /**
     * @notice Admin function to update to a new ControllerContract
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be updated
     * @param _newControllerAddress Address of the new Controller contract
     */
    function updateController(string calldata _symbol, address _newControllerAddress) external onlyOwner {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.changeController(_newControllerAddress);
    }

    /**
     * @notice Admin function to enable/disable Token transfer
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be enabled/disabled
     * @param _transfersEnabled Pass 'true' to enable, 'false' to disable
     */
    function enableTransfers(string calldata _symbol, bool _transfersEnabled) external onlyOwner {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.enableTransfers(_transfersEnabled);
    }

    /**
     * @notice Admin function to update the capped amount
     * @dev onlyOwner - only open to element36 Account
     * @param _symbol Symbol of the Token to be enabled/disabled
     * @param _cap New cap amount to be set for given token
     */
    function updateCap(string calldata _symbol, uint256 _cap) external onlyOwner {
        require(registeredSymbol[_symbol], "not a registered symbol");
        Token36Controller controller = Token36Controller(Token36(tokens[tokenIndexBySymbol[_symbol]]).controller());
        controller.updateCap(_cap);
    }
}