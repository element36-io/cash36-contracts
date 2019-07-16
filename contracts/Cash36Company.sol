pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";


/// @title Cash36 Compliance Contract
/// @notice Is responsible for keeping track of all KYCed users (and possibly Companies), blacklist and attributes.
/// @notice Changes to users can only be done be assigned compliance officer (=owned by Compliance Backend)
/// @author element36.io
contract Cash36Company {

    // Company name
    string private name;

    // Some additional data about the company (could also be an ipfsHash in future)
    string private metaData;

    // List of beneficial owners of the company
    mapping(address => bool) private owners;

    modifier onlyOwners {
        require(owners[msg.sender], "only owners allowed");
        _;
    }

    constructor(string memory _name) public {
        name = _name;
        owners[msg.sender] = true;
    }

    function changeName(string calldata _name) external onlyOwners {
        name = _name;
    }

    function setMetaData(string calldata _metaData) external onlyOwners {
        metaData = _metaData;
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
