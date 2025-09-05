// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        address recipient_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) {
        _mint(recipient_, initialSupply_ * 10 ** decimals());
    }
}