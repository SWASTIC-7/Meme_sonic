// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PumpFunPool is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    
    uint256 public constant GRADUATION_CAP = 69 * 10**18; // 69 HBAR for graduation
    uint256 public constant INITIAL_VIRTUAL_TOKEN_RESERVES = 1073000000 * 10**18; // 1.073B tokens
    uint256 public constant INITIAL_VIRTUAL_HBAR_RESERVES = 30 * 10**18; // 30 HBAR
    
    uint256 public virtualTokenReserves;
    uint256 public virtualHbarReserves;
    uint256 public realTokenReserves;
    uint256 public realHbarReserves;
    bool public graduated;
    
    event TokensPurchased(address indexed buyer, uint256 hbarAmount, uint256 tokenAmount, uint256 newPrice);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 hbarAmount, uint256 newPrice);
    event PoolGraduated(uint256 totalHbarRaised, uint256 timestamp);
    
    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);
        virtualTokenReserves = INITIAL_VIRTUAL_TOKEN_RESERVES;
        virtualHbarReserves = INITIAL_VIRTUAL_HBAR_RESERVES;
        realTokenReserves = 0;
        realHbarReserves = 0;
        graduated = false;
    }
    
    function initializePool(uint256 tokenAmount) external onlyOwner {
        require(realTokenReserves == 0, "Pool already initialized");
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        realTokenReserves = tokenAmount;
    }
    
    function getCurrentPrice() public view returns (uint256) {
        // Price = HBAR reserves / Token reserves (in wei per token)
        return (virtualHbarReserves * 10**18) / virtualTokenReserves;
    }
    
    function getTokensForHbar(uint256 hbarAmount) public view returns (uint256) {
        uint256 newHbarReserves = virtualHbarReserves + hbarAmount;
        uint256 newTokenReserves = (virtualHbarReserves * virtualTokenReserves) / newHbarReserves;
        return virtualTokenReserves - newTokenReserves;
    }
    
    function getHbarForTokens(uint256 tokenAmount) public view returns (uint256) {
        uint256 newTokenReserves = virtualTokenReserves + tokenAmount;
        uint256 newHbarReserves = (virtualHbarReserves * virtualTokenReserves) / newTokenReserves;
        return virtualHbarReserves - newHbarReserves;
    }
    
    function buyTokens() external payable nonReentrant {
        require(!graduated, "Pool has graduated");
        require(msg.value > 0, "Must send HBAR");
        
        uint256 tokensToReceive = getTokensForHbar(msg.value);
        require(tokensToReceive > 0, "Invalid token amount");
        require(tokensToReceive <= realTokenReserves, "Insufficient token reserves");
        
        virtualHbarReserves += msg.value;
        virtualTokenReserves -= tokensToReceive;
        realTokenReserves -= tokensToReceive;
        realHbarReserves += msg.value;
        
        require(token.transfer(msg.sender, tokensToReceive), "Token transfer failed");
        
        emit TokensPurchased(msg.sender, msg.value, tokensToReceive, getCurrentPrice());
        
        if (realHbarReserves >= GRADUATION_CAP) {
            _graduate();
        }
    }
    
    function sellTokens(uint256 tokenAmount) external nonReentrant {
        require(!graduated, "Pool has graduated");
        require(tokenAmount > 0, "Must specify token amount");
        require(token.balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 hbarToReceive = getHbarForTokens(tokenAmount);
        require(hbarToReceive > 0, "Invalid HBAR amount");
        require(hbarToReceive <= realHbarReserves, "Insufficient HBAR reserves");
        
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        virtualTokenReserves += tokenAmount;
        virtualHbarReserves -= hbarToReceive;
        realTokenReserves += tokenAmount;
        realHbarReserves -= hbarToReceive;
        
        (bool success, ) = payable(msg.sender).call{value: hbarToReceive}("");
        require(success, "HBAR transfer failed");
        
        emit TokensSold(msg.sender, tokenAmount, hbarToReceive, getCurrentPrice());
    }
    
    function _graduate() internal {
        graduated = true;
        emit PoolGraduated(realHbarReserves, block.timestamp);
        
    }
    
    function getPoolStats() external view returns (
        uint256 currentPrice,
        uint256 marketCap,
        uint256 totalHbarRaised,
        uint256 tokensRemaining,
        bool isGraduated,
        uint256 progressToGraduation
    ) {
        currentPrice = getCurrentPrice();
        
        uint256 totalSupply = token.totalSupply();
        marketCap = (totalSupply * currentPrice) / 10**18;
        
        totalHbarRaised = realHbarReserves;
        tokensRemaining = realTokenReserves;
        isGraduated = graduated;
        progressToGraduation = (totalHbarRaised * 100) / GRADUATION_CAP;
        
        if (progressToGraduation > 100) {
            progressToGraduation = 100;
        }
    }
    
    function getHbarPriceInUSD() public pure returns (uint256) {
        return 6; // cents
    }
    
    function getTokenPriceInUSD() external view returns (uint256) {
        uint256 priceInHbar = getCurrentPrice(); 
        uint256 hbarPriceInCents = getHbarPriceInUSD();
        
        return (priceInHbar * hbarPriceInCents) / 10**18;
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(graduated || realHbarReserves == 0, "Cannot withdraw during active trading");
        
        uint256 hbarBalance = address(this).balance;
        uint256 tokenBalance = token.balanceOf(address(this));
        
        if (hbarBalance > 0) {
            (bool success, ) = payable(owner()).call{value: hbarBalance}("");
            require(success, "HBAR withdrawal failed");
        }
        
        if (tokenBalance > 0) {
            require(token.transfer(owner(), tokenBalance), "Token withdrawal failed");
        }
    }
    
    receive() external payable {
        this.buyTokens();
    }
}