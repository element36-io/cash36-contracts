pragma solidity ^0.5.9;


/// @title Cash36 Interface to keep track of which block the inheriting contract is created
/// @author element36.io
contract Initializable {

    uint256 internal initializationBlock;

    modifier onlyInit {
        require(initializationBlock == 0);
        _;
    }

    modifier isInitialized {
        require(initializationBlock > 0);
        _;
    }

    /**
     * @notice
     * @return Block number in which the contract was initialized
     */
    function getInitializationBlock() public view returns (uint256) {
        return initializationBlock;
    }

    /**
     * @dev Function to be called by top level contract after initialization has finished.
     */
    function initialized() internal onlyInit {
        initializationBlock = getBlockNumber();
    }

    /**
     * @dev Returns the current block number.
     *      Using a function rather than `block.number` allows us to easily mock the block number in
     *      tests.
     */
    function getBlockNumber() internal view returns (uint256) {
        return block.number;
    }
}