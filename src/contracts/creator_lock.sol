// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSaleValidator is ReentrancyGuard, Ownable {
    
    uint256 public constant SALE_PERCENTAGE = 2; // 2% per sale
    uint256 public constant COOLDOWN_PERIOD = 32 hours; // 32 hours between sales
    
    uint256[] public milestones = [50, 60, 70, 80, 90, 100]; 
    
    struct UserSaleInfo {
        uint256 currentMilestoneIndex;
        uint256 lastSaleTime;
        uint256 totalSold;
        bool isPostGraduation;
    }
    
    mapping(address => UserSaleInfo) public userSales;
    
    event SaleValidated(address indexed user, uint256 amount, uint256 milestone, uint256 timestamp);
    event MilestoneReached(address indexed user, uint256 milestone, uint256 timestamp);
    event PostGraduationMode(address indexed user, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    function canSell(
        address user,
        uint256 graduationProgress,
        uint256 totalTokens,
        uint256 saleAmount
    ) external view returns (bool) {
        
        UserSaleInfo memory userInfo = userSales[user];
        
        uint256 maxSaleAmount = (totalTokens * SALE_PERCENTAGE) / 100;
        
        if (saleAmount > maxSaleAmount) {
            return false;
        }
        
        if (block.timestamp < userInfo.lastSaleTime + COOLDOWN_PERIOD) {
            return false;
        }
        
        if (userInfo.isPostGraduation || graduationProgress >= 100) {
            return true;
        }
        
        if (userInfo.currentMilestoneIndex >= milestones.length) {
            return true;
        }
        
        uint256 requiredMilestone = milestones[userInfo.currentMilestoneIndex];
        
        if (graduationProgress >= requiredMilestone) {
            return true;
        }
        
        return false;
    }
    
    function validateSale(
        address user,
        uint256 graduationProgress,
        uint256 totalTokens,
        uint256 saleAmount
    ) external nonReentrant returns (bool) {
        
        if (!this.canSell(user, graduationProgress, totalTokens, saleAmount)) {
            return false;
        }
        
        UserSaleInfo storage userInfo = userSales[user];
        
        userInfo.totalSold += saleAmount;
        userInfo.lastSaleTime = block.timestamp;
        
        if (!userInfo.isPostGraduation && graduationProgress < 100) {
            
            if (userInfo.currentMilestoneIndex < milestones.length) {
                uint256 requiredMilestone = milestones[userInfo.currentMilestoneIndex];
                
                if (graduationProgress >= requiredMilestone) {
                    emit MilestoneReached(user, requiredMilestone, block.timestamp);
                    userInfo.currentMilestoneIndex++;
                    
                    if (userInfo.currentMilestoneIndex >= milestones.length) {
                        userInfo.isPostGraduation = true;
                        emit PostGraduationMode(user, block.timestamp);
                    }
                }
            }
        } else if (!userInfo.isPostGraduation) {
            userInfo.isPostGraduation = true;
            emit PostGraduationMode(user, block.timestamp);
        }
        
        emit SaleValidated(
            user, 
            saleAmount, 
            userInfo.isPostGraduation ? 100 : (userInfo.currentMilestoneIndex > 0 ? milestones[userInfo.currentMilestoneIndex - 1] : 0),
            block.timestamp
        );
        
        return true;
    }
    
    function getUserSaleInfo(address user) external view returns (
        uint256 currentMilestoneIndex,
        uint256 lastSaleTime,
        uint256 totalSold,
        bool isPostGraduation,
        uint256 nextMilestone,
        uint256 timeUntilNextSale
    ) {
        UserSaleInfo memory userInfo = userSales[user];
        
        currentMilestoneIndex = userInfo.currentMilestoneIndex;
        lastSaleTime = userInfo.lastSaleTime;
        totalSold = userInfo.totalSold;
        isPostGraduation = userInfo.isPostGraduation;
        
        nextMilestone = userInfo.currentMilestoneIndex < milestones.length ? 
            milestones[userInfo.currentMilestoneIndex] : 100;
            
        timeUntilNextSale = block.timestamp >= userInfo.lastSaleTime + COOLDOWN_PERIOD ? 
            0 : (userInfo.lastSaleTime + COOLDOWN_PERIOD) - block.timestamp;
    }
    
    function getMaxSaleAmount(uint256 totalTokens) external pure returns (uint256) {
        return (totalTokens * SALE_PERCENTAGE) / 100;
    }
    
    function getRemainingMilestones(address user) external view returns (uint256[] memory) {
        UserSaleInfo memory userInfo = userSales[user];
        
        if (userInfo.currentMilestoneIndex >= milestones.length) {
            return new uint256[](0);
        }
        
        uint256[] memory remaining = new uint256[](milestones.length - userInfo.currentMilestoneIndex);
        for (uint256 i = 0; i < remaining.length; i++) {
            remaining[i] = milestones[userInfo.currentMilestoneIndex + i];
        }
        return remaining;
    }
    
    function resetUserData(address user) external onlyOwner {
        delete userSales[user];
    }
    
    function getMilestones() external view returns (uint256[] memory) {
        return milestones;
    }
}