pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


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

    function calcFee(uint256 _value) public view returns (uint256) {
        return _value.mul(feeNominator).div(feeDenominator);
    }

    function changeFee(uint256 _newFeeNominator, uint256 _newFeeDenominator) external onlyFeeCollector {
        feeNominator = _newFeeNominator;
        feeDenominator = _newFeeDenominator;
    }

    function changeFeeCollector(address _newAddress) external onlyFeeCollector {
        feeCollector = _newAddress;
    }
}