
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

contract RouletteGame is AbstractCasinoBase {
    struct Bet {
        uint8 number;
        uint256 amount;
        BetType betType;
    }
    
    enum BetType { Single, Red, Black, Even, Odd }
    
    mapping(address => Bet) public bets;
    
    event BetPlaced(address player, uint8 number, BetType betType);
    event RouletteResult(address player, uint8 result, bool won, uint256 payout);
    
    constructor() AbstractCasinoBase(250, 0.0025 ether, 0.5 ether) {}
    
    function placeBet(uint8 number, BetType betType) external payable whenNotPaused {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(number <= 36, "Invalid number");
        
        bets[msg.sender] = Bet({
            number: number,
            amount: msg.value,
            betType: betType
        });
        
        emit BetPlaced(msg.sender, number, betType);
        spin(msg.sender);
    }
    
    function spin(address player) private {
        uint8 result = uint8(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            player
        ))) % 37);
        
        Bet memory bet = bets[player];
        bool won;
        uint256 multiplier;
        
        if (bet.betType == BetType.Single) {
            won = (result == bet.number);
            multiplier = 35;
        } else if (bet.betType == BetType.Red) {
            won = isRed(result);
            multiplier = 1;
        } else if (bet.betType == BetType.Black) {
            won = !isRed(result) && result != 0;
            multiplier = 1;
        } else if (bet.betType == BetType.Even) {
            won = result != 0 && result % 2 == 0;
            multiplier = 1;
        } else { // Odd
            won = result != 0 && result % 2 == 1;
            multiplier = 1;
        }
        
        if (won) {
            uint256 payout = bet.amount * (multiplier + 1);
            payable(player).transfer(payout);
        }
        
        emit RouletteResult(player, result, won, won ? bet.amount * (multiplier + 1) : 0);
        delete bets[player];
    }
    
    function isRed(uint8 number) private pure returns (bool) {
        if (number == 0) return false;
        uint8[18] memory redNumbers = [
            1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
        ];
        for (uint8 i = 0; i < 18; i++) {
            if (redNumbers[i] == number) return true;
        }
        return false;
    }
}
