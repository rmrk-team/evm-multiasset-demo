// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKMultiAssetImpl.sol";

contract CookBook is RMRKMultiAssetImpl {
    
    constructor(InitData memory data)
        RMRKMultiAssetImpl(
            "Cookbook",
            "COBO",
            "ipfs://metadata",
            "ipfs://tokenMetadata",
            data
        )
    {}
}
