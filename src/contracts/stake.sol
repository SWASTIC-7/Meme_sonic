// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract HbarStaking {
    uint256 public constant STAKE_AMOUNT = 1; 
    uint256 public constant LOCK_PERIOD = 1 minutes; 

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        bool withdrawn;
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount);

    function stake() external payable {
        // require(msg.value == STAKE_AMOUNT, "Incorrect HBAR amount");
        require(stakes[msg.sender].amount == 0 || stakes[msg.sender].withdrawn, "Already staked");

        stakes[msg.sender] = StakeInfo({
            amount: msg.value,
            timestamp: block.timestamp,
            withdrawn: false
        });

        emit Staked(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external {
        StakeInfo storage userStake = stakes[msg.sender];

        require(userStake.amount > 0, "Nothing staked");
        require(!userStake.withdrawn, "Already withdrawn");
        require(block.timestamp >= userStake.timestamp + LOCK_PERIOD, "Lock period not over");

        userStake.withdrawn = true;

        (bool sent, ) = msg.sender.call{value: userStake.amount}("");
        require(sent, "Transfer failed");

        emit Withdrawn(msg.sender, userStake.amount);
    }

    function getStakeInfo(address user) external view returns (StakeInfo memory) {
        return stakes[user];
    }

    receive() external payable {}
}
