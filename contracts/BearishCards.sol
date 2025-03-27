
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

contract BearishCards is AbstractCasinoBase {
    struct Card {
        uint8 rank;  // 2-14 (14=Ace)
        uint8 suit;  // 0-3 (Hearts, Diamonds, Clubs, Spades)
        string nftImage; // URI to Bearish NFT image
    }
    
    struct Game {
        bytes32 id;
        address player;
        Card[] playerHand;
        Card[] dealerHand;
        uint256 betAmount;
        bool completed;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Game) public games;
    bytes32[] public activeGames;
    
    string[] public bearishNftUris;
    
    constructor() AbstractCasinoBase(250, 0.0025 ether, 0.5 ether) {
        // Initialize Bearish NFT URIs
        bearishNftUris.push("ipfs://bearish1");
        bearishNftUris.push("ipfs://bearish2");
        // Add more NFT URIs
    }
    
    function startGame() external payable whenNotPaused {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        
        bytes32 gameId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            blockhash(block.number - 1)
        ));
        
        Game storage game = games[gameId];
        game.id = gameId;
        game.player = msg.sender;
        game.betAmount = msg.value;
        game.timestamp = block.timestamp;
        
        // Deal initial cards
        dealCards(gameId);
        
        activeGames.push(gameId);
    }
    
    function dealCards(bytes32 gameId) internal {
        // Implementation for dealing cards with Bearish NFTs
        // This would use a random number generator and assign NFT images
    }
    
    // Additional game logic methods would go here
}
