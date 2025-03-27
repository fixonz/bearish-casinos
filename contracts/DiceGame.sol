// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

/**
 * @title DiceGame
 * @dev A dice game where players can bet on rolling above or below a certain number
 * Players select a target number and have a proportional chance of winning based on their selection
 */
contract DiceGame is AbstractCasinoBase {
    // ============ Events ============
    event DiceRolled(
        address indexed player,
        uint8 targetNumber,
        bool isOver,
        uint8 result,
        bool playerWon,
        uint256 betAmount,
        uint256 winAmount
    );
    
    // ============ State Variables ============
    uint8 public constant MIN_ROLL = 1;
    uint8 public constant MAX_ROLL = 100;
    
    // Pyth Entropy variables
    IPythEntropy public pythEntropy;
    mapping(bytes32 => bool) public pendingRequests;
    
    // Request tracking
    bytes32 public lastRequestId;
    bytes32 public lastRevealedRandomness;
    
    /**
     * @dev Constructor
     * @param _houseEdge The house edge in basis points (e.g., 250 = 2.5%)
     * @param _minBet The minimum bet amount
     * @param _maxBet The maximum bet amount
     */
    constructor(
        uint256 _houseEdge, 
        uint256 _minBet, 
        uint256 _maxBet,
        address _pythEntropyAddress
    ) AbstractCasinoBase(_houseEdge, _minBet, _maxBet) {
        pythEntropy = IPythEntropy(_pythEntropyAddress);
    }
    
    /**
     * @dev Play the dice game betting that roll will be over or under the target number
     * @param targetNumber The target number (1-100)
     * @param isOver Whether the player bets the roll will be over the target (true) or under (false)
     * @param betAmount The amount being bet
     */
    function playDice(uint8 targetNumber, bool isOver, uint256 betAmount) 
        external whenNotPaused onlyRegistered returns (uint8) {
        // Validate the target number
        require(targetNumber > MIN_ROLL && targetNumber < MAX_ROLL, "DiceGame: target must be between 2 and 99");
        
        // Calculate win probability
        uint256 winProbability;
        if (isOver) {
            winProbability = MAX_ROLL - targetNumber;
        } else {
            winProbability = targetNumber - MIN_ROLL;
        }
        
        // Calculate multiplier based on win probability with house edge
        // Multiplier = 100 / win_probability * (1 - house_edge)
        uint256 multiplier = (10000 * (10000 - houseEdge)) / (winProbability * 100);
        
        // Validate and place the bet
        _placeBet(betAmount);
        
        // Generate the random roll
        uint8 roll = _generateRandomRoll();
        
        // Determine if player won
        bool playerWon;
        if (isOver) {
            playerWon = roll > targetNumber;
        } else {
            playerWon = roll < targetNumber;
        }
        
        // Calculate winnings
        uint256 winAmount = 0;
        if (playerWon) {
            winAmount = (betAmount * multiplier) / 10000;
        }
        
        // Update player stats
        _updatePlayerStats(msg.sender, "DICE", betAmount, winAmount);
        
        // Emit event
        emit DiceRolled(msg.sender, targetNumber, isOver, roll, playerWon, betAmount, winAmount);
        
        return roll;
    }
    
    /**
     * @dev Generate a pseudo-random roll between 1 and 100
     * Note: This is not secure and would be replaced with VRF in production
     * @return A pseudo-random number between 1 and 100
     */
    function _generateRandomRoll() private returns (uint8) {
        lastRequestId = pythEntropy.requestRandomness();
        pendingRequests[lastRequestId] = true;
        
        // Wait for randomness to be revealed
        bytes32 randomness = pythEntropy.getRandomness(lastRequestId);
        require(randomness != bytes32(0), "Randomness not yet available");
        
        pendingRequests[lastRequestId] = false;
        lastRevealedRandomness = randomness;
        
        return uint8((uint256(randomness) % 100) + 1);
    }
    
    /**
     * @dev Calculate the multiplier for a given target number and direction
     * @param targetNumber The target number (1-100)
     * @param isOver Whether the player bets the roll will be over the target (true) or under (false)
     * @return The multiplier (in basis points, e.g., 20000 = 2.00x)
     */
    function calculateMultiplier(uint8 targetNumber, bool isOver) external view returns (uint256) {
        require(targetNumber > MIN_ROLL && targetNumber < MAX_ROLL, "DiceGame: target must be between 2 and 99");
        
        uint256 winProbability;
        if (isOver) {
            winProbability = MAX_ROLL - targetNumber;
        } else {
            winProbability = targetNumber - MIN_ROLL;
        }
        
        // Multiplier = 100 / win_probability * (1 - house_edge)
        return (10000 * (10000 - houseEdge)) / (winProbability * 100);
    }
}