
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

contract HiLoGame is AbstractCasinoBase {
    struct Game {
        uint256 currentNumber;
        uint256 multiplier;
        bool isActive;
        uint256 betAmount;
    }
    
    mapping(address => Game) public games;
    
    event GameStarted(address player, uint256 initialNumber);
    event GameResult(address player, bool won, uint256 multiplier);
    
    constructor() AbstractCasinoBase(250, 0.0025 ether, 0.5 ether) {}
    
    function startGame() external payable whenNotPaused {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(!games[msg.sender].isActive, "Game already in progress");
        
        uint256 initialNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        ))) % 100;
        
        games[msg.sender] = Game({
            currentNumber: initialNumber,
            multiplier: 100,
            isActive: true,
            betAmount: msg.value
        });
        
        emit GameStarted(msg.sender, initialNumber);
    }
    
    function guess(bool isHigher) external whenNotPaused {
        Game storage game = games[msg.sender];
        require(game.isActive, "No active game");
        
        uint256 nextNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            game.currentNumber
        ))) % 100;
        
        bool won = isHigher ? nextNumber > game.currentNumber : nextNumber < game.currentNumber;
        
        if (won) {
            uint256 winAmount = game.betAmount * game.multiplier / 100;
            payable(msg.sender).transfer(winAmount);
        }
        
        game.isActive = false;
        emit GameResult(msg.sender, won, game.multiplier);
    }
}
