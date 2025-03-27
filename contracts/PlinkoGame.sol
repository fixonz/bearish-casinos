
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

contract PlinkoGame is AbstractCasinoBase {
    struct Drop {
        uint256[] path;
        uint256 multiplier;
        bool completed;
    }
    
    mapping(address => Drop) public drops;
    uint256[] public multipliers = [88, 44, 14, 8, 6, 4, 3, 2, 3, 4, 6, 8, 14, 44, 88];
    
    event DropStarted(address player, uint256 betAmount);
    event DropResult(address player, uint256[] path, uint256 multiplier);
    
    constructor() AbstractCasinoBase(250, 0.0025 ether, 0.5 ether) {}
    
    function drop() external payable whenNotPaused {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(!drops[msg.sender].completed, "Previous drop not complete");
        
        uint256[] memory path = new uint256[](8);
        uint256 position = 7; // Start in middle
        
        for (uint256 i = 0; i < 8; i++) {
            bool goRight = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.difficulty,
                msg.sender,
                i
            ))) % 2 == 1;
            
            position = goRight ? position + 1 : position;
            path[i] = position;
        }
        
        uint256 finalMultiplier = multipliers[position];
        uint256 winAmount = msg.value * finalMultiplier / 100;
        
        drops[msg.sender] = Drop({
            path: path,
            multiplier: finalMultiplier,
            completed: true
        });
        
        payable(msg.sender).transfer(winAmount);
        emit DropResult(msg.sender, path, finalMultiplier);
    }
}
