// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract TokenTradingRestriction {
    IERC20 public immutable token;
    uint256 public constant SELL_PERCENTAGE_LIMIT = 200; // 2% = 200/10000
    uint256 public constant BUY_PERCENTAGE_LIMIT = 500;  // 5% = 500/10000
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;
    
    struct UserData {
        uint256 lastSellTimestamp;
        uint256 totalBoughtTokens;
        uint256 initialBalance;
    }
    
    mapping(address => UserData) public userData;
    
    event SellAttempt(address indexed user, uint256 amount, bool success, string reason);
    event BuyAttempt(address indexed user, uint256 amount, bool success, string reason);
    event UserRegistered(address indexed user, uint256 initialBalance);
    
    modifier onlyRegistered() {
        require(userData[msg.sender].initialBalance > 0, "User not registered");
        _;
    }
    
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }
    
    function registerUser(uint256 _totalTokenAmount) external {
        require(_totalTokenAmount > 0, "Total token amount must be greater than 0");
        require(userData[msg.sender].initialBalance == 0, "User already registered");
        
        userData[msg.sender] = UserData({
            lastSellTimestamp: 0,
            totalBoughtTokens: 0,
            initialBalance: _totalTokenAmount
        });
        
        emit UserRegistered(msg.sender, _totalTokenAmount);
    }
    
    function canSell(address user, uint256 amount) public view returns (bool, string memory) {
        UserData memory data = userData[user];
        
        if (data.initialBalance == 0) {
            return (false, "User not registered");
        }
        
        if (block.timestamp < data.lastSellTimestamp + COOLDOWN_PERIOD) {
            return (false, "Cooldown period not over");
        }
        
        uint256 maxSellAmount = (data.initialBalance * SELL_PERCENTAGE_LIMIT) / PERCENTAGE_DENOMINATOR;
        if (amount > maxSellAmount) {
            return (false, "Amount exceeds 2% limit");
        }
        
        uint256 currentBalance = token.balanceOf(user);
        if (amount > currentBalance) {
            return (false, "Insufficient token balance");
        }
        
        return (true, "Can sell");
    }
    
    function canBuy(address user, uint256 amount) public view returns (bool, string memory) {
        UserData memory data = userData[user];
        
        if (data.initialBalance == 0) {
            return (false, "User not registered");
        }
        
        uint256 maxBuyAmount = (data.initialBalance * BUY_PERCENTAGE_LIMIT) / PERCENTAGE_DENOMINATOR;
        if (data.totalBoughtTokens + amount > maxBuyAmount) {
            return (false, "Would exceed 5% total buy limit");
        }
        
        return (true, "Can buy");
    }
    
    function sell(address to, uint256 amount) external onlyRegistered {
        (bool canSellTokens, string memory reason) = canSell(msg.sender, amount);
        
        if (!canSellTokens) {
            emit SellAttempt(msg.sender, amount, false, reason);
            revert(reason);
        }
        
        userData[msg.sender].lastSellTimestamp = block.timestamp;
        
        require(token.transferFrom(msg.sender, to, amount), "Transfer failed");
        
        emit SellAttempt(msg.sender, amount, true, "Sell successful");
    }
    
    function buy(address from, uint256 amount) external onlyRegistered {
        (bool canBuyTokens, string memory reason) = canBuy(msg.sender, amount);
        
        if (!canBuyTokens) {
            emit BuyAttempt(msg.sender, amount, false, reason);
            revert(reason);
        }
        
        userData[msg.sender].totalBoughtTokens += amount;
        
        require(token.transferFrom(from, msg.sender, amount), "Transfer failed");
        
        emit BuyAttempt(msg.sender, amount, true, "Buy successful");
    }
    
    function getUserData(address user) external view returns (UserData memory) {
        return userData[user];
    }
    
    function getTimeUntilNextSell(address user) external view returns (uint256) {
        UserData memory data = userData[user];
        if (data.lastSellTimestamp == 0) {
            return 0;
        }
        
        uint256 nextSellTime = data.lastSellTimestamp + COOLDOWN_PERIOD;
        if (block.timestamp >= nextSellTime) {
            return 0;
        }
        
        return nextSellTime - block.timestamp;
    }
    
    function getMaxSellAmount(address user) external view returns (uint256) {
        UserData memory data = userData[user];
        if (data.initialBalance == 0) {
            return 0;
        }
        return (data.initialBalance * SELL_PERCENTAGE_LIMIT) / PERCENTAGE_DENOMINATOR;
    }
    
    function getRemainingBuyCapacity(address user) external view returns (uint256) {
        UserData memory data = userData[user];
        if (data.initialBalance == 0) {
            return 0;
        }
        
        uint256 maxBuyAmount = (data.initialBalance * BUY_PERCENTAGE_LIMIT) / PERCENTAGE_DENOMINATOR;
        if (data.totalBoughtTokens >= maxBuyAmount) {
            return 0;
        }
        
        return maxBuyAmount - data.totalBoughtTokens;
    }
}