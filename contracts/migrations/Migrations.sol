pragma solidity ^0.4.24;


contract Migrations {
    address public owner;
    uint public lastCompletedMigration;

    modifier restricted() {
        if (msg.sender == owner) {
            _;
        }
    }

    constructor() {
        owner = msg.sender;
    }

    function setCompleted(uint _completed) restricted {
        lastCompletedMigration = _completed;
    }

    function upgrade(address _newAddress) restricted {
        Migrations upgraded = Migrations(_newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
