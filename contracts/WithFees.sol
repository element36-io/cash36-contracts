pragma solidity ^0.5.9;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/// @title Cash36 Interface holding Fees and FeeCollector address
/// @author element36.io
contract WithFees {
    using SafeMath for uint256;

    address public feeCollector;
    uint256 internal feeNominator = 20;
    uint256 internal feeDenominator = 1000;

    // Allow only controller address to access
    modifier onlyFeeCollector {
        require(msg.sender == feeCollector);
        _;
    }

    // Constructor
    constructor()  public {
        feeCollector = msg.sender;
    }

    /**
     * @notice Calculate the Fee for given value
     * @param _value Value to calculate fee for
     * @return {
     *   "uint256": "The calculated Fee"
     * }
     */
    function calcFee(uint256 _value) public view returns (uint256) {
        return _value.mul(feeNominator).div(feeDenominator);
    }

    /**
     * @notice Change the fees
     * @dev onlyFeeCollector - only open to the fee collector
     * @param _newFeeNominator Fee nominator
     * @param _newFeeDenominator Fee denominator
     */
    function changeFee(uint256 _newFeeNominator, uint256 _newFeeDenominator) external onlyFeeCollector {
        feeNominator = _newFeeNominator;
        feeDenominator = _newFeeDenominator;
    }

    /**
     * @notice Change the fee collector
     * @dev onlyFeeCollector - only open to the fee collector
     * @param _newAddress New fee collector address
     */
    function changeFeeCollector(address _newAddress) external onlyFeeCollector {
        feeCollector = _newAddress;
    }
}