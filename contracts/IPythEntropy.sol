
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPythEntropy {
    function requestRandomness() external returns (bytes32);
    function getRandomness(bytes32 requestId) external view returns (bytes32);
    function lastRevealedId() external view returns (bytes32);
    function latestRevealedRoundId() external view returns (uint256);
}
