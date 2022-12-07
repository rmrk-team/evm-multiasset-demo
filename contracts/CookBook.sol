// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKMultiAssetImpl.sol";

contract CookBook is RMRKMultiAssetImpl {
    
    constructor(uint256 maxSupply, uint256 pricePerMint)
        RMRKMultiAssetImpl(
            "Cookbook",
            "COBO",
            maxSupply,
            pricePerMint,
            "ipfs://metadata",
            "ipfs://tokenMetadata",
            msg.sender,
            100
        )
    {}
}
