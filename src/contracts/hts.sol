// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IHederaTokenService {
    function createFungibleToken(
        address treasury,
        uint64 initialSupply,
        uint32 decimals,
        string memory name,
        string memory symbol
    ) external returns (int64 responseCode, address tokenAddress);
}

contract MemecoinFactory {
    address constant HTS_PRECOMPILE_ADDRESS = address(0x167);
    IHederaTokenService constant hts = IHederaTokenService(HTS_PRECOMPILE_ADDRESS);

    event TokenCreated(address tokenAddress, string name, string symbol, uint256 totalSupply);

    function createMemecoin(
        string memory name,
        string memory symbol,
        uint64 initialSupply,
        uint32 decimals
    ) external returns (address tokenAddress, string memory createdName, string memory createdSymbol, uint256 total) {
        address treasury = msg.sender;

        (int64 responseCode, address newTokenAddress) = hts.createFungibleToken(
            treasury,
            initialSupply,
            decimals,
            name,
            symbol
        );

        require(responseCode == 22, "Token creation failed"); // 22 = SUCCESS

        emit TokenCreated(newTokenAddress, name, symbol, initialSupply);

        return (newTokenAddress, name, symbol, initialSupply);
    }
}
