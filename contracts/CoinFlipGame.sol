// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

/**
 * @title CoinFlipGame
 * @dev A simple coin flip game built on the Abstract Network
 * Players can bet on either heads or tails, with a default 50/50 chance of winning
 * (minus house edge)
 */
contract CoinFlipGame is AbstractCasinoBase {
    // ============ Events ============
    event CoinFlipped(address indexed player, bool isHeads, bool playerWon, uint256 betAmount, uint256 winAmount);
    
    // ============ State Variables ============
    uint256 private constant MULTIPLIER = 2; // 2x for a win (1:1 odds)
    
    // VRF related variables will be added for true randomness
    bytes32 private lastHash;
    uint256 private nonce;
    
    /**
     * @dev Constructor
     * @param _houseEdge The house edge in basis points (e.g., 250 = 2.5%)
     * @param _minBet The minimum bet amount
     * @param _maxBet The maximum bet amount
     */
    constructor(uint256 _houseEdge, uint256 _minBet, uint256 _maxBet) 
        AbstractCasinoBase(_houseEdge, _minBet, _maxBet) {
        // Initialize with a seed hash
        lastHash = keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, msg.sender));
        nonce = 0;
    }
    
    /**
     * @dev Play the coin flip game
     * @param isHeads Whether the player is betting on heads (true) or tails (false)
     * @param betAmount The amount being bet
     */
    function playCoinFlip(bool isHeads, uint256 betAmount) external whenNotPaused onlyRegistered returns (bool) {
        // Validate and place the bet
        _placeBet(betAmount);
        
        // Generate the random result
        bool result = _generateRandomResult();
        
        // Determine if player won
        bool playerWon = (isHeads == result);
        
        // Calculate winnings
        uint256 winAmount = 0;
        if (playerWon) {
            // Calculate winnings with house edge applied
            uint256 payout = (betAmount * MULTIPLIER * (10000 - houseEdge)) / 10000;
            winAmount = payout;
        }
        
        // Update player stats
        _updatePlayerStats(msg.sender, "COIN_FLIP", betAmount, winAmount);
        
        // Emit event
        emit CoinFlipped(msg.sender, isHeads, playerWon, betAmount, winAmount);
        
        return playerWon;
    }
    
    /**
     * @dev Generate a pseudo-random result
     * Note: This is not secure and would be replaced with VRF in production
     * @return A pseudo-random boolean
     */
    function _generateRandomResult() private returns (bool) {
        nonce++;
        lastHash = keccak256(abi.encodePacked(lastHash, msg.sender, nonce, block.timestamp));
        return uint256(lastHash) % 2 == 0;
    }
    
    /**
     * @dev View function to get game information
     * @return The multiplier, house edge, and win probability
     */
    function getGameInfo() external view returns (uint256, uint256, uint256) {
        uint256 winProbability = (10000 - houseEdge) / 2; // Approximately 48.75% with 2.5% house edge
        return (MULTIPLIER, houseEdge, winProbability);
    }
}