pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token36.sol";
import "./Token36Controller.sol";


/// @title Cash36 Main Index Contract
/// @notice Main Contract of cash36. Acts as an Index to keep track of all official cash36 contracts and more.
/// @author element36.io
contract Cash36 is Ownable {

    // Compliance Contract address
    address complianceAddress;

    // Token Storage
    address[] tokens;
    mapping(string => bool) registeredSymbol;
    mapping(string => uint256) tokenIndexBySymbol;

    // Constructor
    constructor(address _complianceAddress) public {
        complianceAddress = _complianceAddress;
    }

    // Event
    event TokenCreated(string _name, string _symbol, address tokenAddress, address tokenControllerAddress);

    /**
     * @notice Create a new Cash36 Token
     * @dev Also creates a token controller (calls Event TokenCreated on success)
     * @dev Symbol must be unique.
     * @dev onlyOwner - only open to element36 Account
     * @param _name Name of the token (as with ERC20)
     * @param _symbol Symbol of the token (as with ERC20)
     */
    function createNewToken(string _name, string _symbol) external onlyOwner {
        require(keccak256(abi.encodePacked(_name)) != keccak256(abi.encodePacked("")), "name cannot be empty");
        require(keccak256(abi.encodePacked(_symbol)) != keccak256(abi.encodePacked("")), "symbol cannot be empty");
        require(registeredSymbol[_symbol] == false, "symbol already registered");

        Token36 newToken = new Token36(_name, _symbol);
        newToken.changeFeeCollector(msg.sender);

        tokenIndexBySymbol[_symbol] = tokens.length;
        tokens.push(newToken);
        registeredSymbol[_symbol] = true;

        // Create and Set new Controller as token controller - will be owned by this contract
        Token36Controller newController = new Token36Controller(newToken, complianceAddress);
        newToken.changeController(address(newController));

        emit TokenCreated(_name, _symbol, address(newToken), address(newController));
    }

    /**
     * @notice Get all Cash36 Tokens
     * @return Array of addresses of all Cash36 Tokens
     */
    function getTokens() external view returns (address[]) {
        return tokens;
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
     * @notice Admin function to update to a new ComplianceContract
     * @dev onlyOwner - only open to element36 Account
     * @dev not yet implemented
     */
    function updateCompliance(address _newComplianceAddress) external onlyOwner {
        complianceAddress = _newComplianceAddress;

        // TODO: update all Token36Controller
        // controller.updateCompliance(complianceAddress);
    }

    /**
     * @notice Admin function to enable/disable Token transfer
     * @dev onlyOwner - only open to element36 Account
     */
    function enableTransfers(string _symbol, bool _transfersEnabled) external onlyOwner {
        Token36(tokens[tokenIndexBySymbol[_symbol]]).enableTransfers(_transfersEnabled);
    }
}