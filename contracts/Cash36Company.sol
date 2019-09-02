pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";


/// @title Cash36 Company Contract
/// @notice Represents a Company in cash36 - needed for Onboarding of Companies with Accounts and Beneficial Owners
/// @author element36.io
contract Cash36Company {

    // Company name
    string private _name;

    // Some additional data about the company (could also be an ipfsHash in future)
    string private _metaData;

    // List of beneficial owners of the company
    mapping(address => bool) private owners;

    modifier onlyOwners {
        require(owners[msg.sender], "only owners allowed");
        _;
    }

    constructor(string memory name) public {
        _name = name;
        owners[msg.sender] = true;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function metaData() external view returns (string memory) {
        return _metaData;
    }

    function changeName(string calldata name) external onlyOwners {
        _name = name;
    }

    function setMetaData(string calldata metaData) external onlyOwners {
        _metaData = metaData;
    }

    function addOwner(address _newOwner) external onlyOwners {
        owners[_newOwner] = true;
    }

    function removeOwner(address _owner) external onlyOwners {
        owners[_owner] = false;
    }

    function transfer(ERC20Burnable _token, address _to, uint256 _amount) external onlyOwners {
        _token.transfer(_to, _amount);
    }

    function transferFrom(ERC20Burnable _token, address _from, address _to, uint256 _amount) external onlyOwners {
        _token.transferFrom(_from, _to, _amount);
    }

    function burn(ERC20Burnable _token, uint256 _amount) external onlyOwners {
        _token.burn(_amount);
    }

    function burnFrom(ERC20Burnable _token, address _from, uint256 _amount) external onlyOwners {
        _token.burnFrom(_from, _amount);
    }
}
