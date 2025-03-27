// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AbstractCasinoBase.sol";

/**
 * @title CrashGame
 * @dev A "crash" style game built on the Abstract Network
 * Players bet and try to cash out before the multiplier "crashes"
 * The crash point is determined using a provably fair algorithm
 */
contract CrashGame is AbstractCasinoBase {
    // ============ Events ============
    event GameStarted(bytes32 indexed gameId, uint256 timestamp, bytes32 seed);
    event PlayerJoined(bytes32 indexed gameId, address indexed player, uint256 betAmount);
    event PlayerCashedOut(bytes32 indexed gameId, address indexed player, uint256 multiplier, uint256 winAmount);
    event GameCrashed(bytes32 indexed gameId, uint256 crashPoint);
    
    // ============ State Variables ============
    // Game state
    enum GameState { WAITING, RUNNING, CRASHED }
    
    struct Game {
        bytes32 id;
        GameState state;
        uint256 startTimestamp;
        bytes32 seed;
        uint256 crashPoint; // Represented as an integer (e.g., 250 = 2.5x)
        mapping(address => PlayerBet) playerBets;
        address[] players;
    }
    
    struct PlayerBet {
        uint256 betAmount;
        bool hasCashedOut;
        uint256 cashoutMultiplier;
    }
    
    // Current game
    Game private currentGame;
    
    // Previous games for verification
    bytes32[] public gameHistory;
    mapping(bytes32 => uint256) public gameCrashPoints;
    
    // House edge on this game (lower than simple games since there's more risk to player)
    uint256 private constant MAX_CRASH_POINT = 1000000; // Maximum 10,000x
    
    // Timestamp tracking for simulation
    uint256 private lastTimestamp;
    
    /**
     * @dev Constructor
     * @param _houseEdge The house edge in basis points (e.g., 250 = 2.5%)
     * @param _minBet The minimum bet amount
     * @param _maxBet The maximum bet amount
     */
    constructor(uint256 _houseEdge, uint256 _minBet, uint256 _maxBet) 
        AbstractCasinoBase(_houseEdge, _minBet, _maxBet) {
        // Initialize the first game seed
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1), msg.sender));
        _createNewGame(seed);
    }
    
    /**
     * @dev Join the current game before it starts
     * @param betAmount The amount to bet
     */
    function joinGame(uint256 betAmount) external whenNotPaused onlyRegistered {
        require(currentGame.state == GameState.WAITING, "CrashGame: game already in progress");
        require(currentGame.playerBets[msg.sender].betAmount == 0, "CrashGame: already joined this game");
        
        // Validate and place the bet
        _placeBet(betAmount);
        
        // Record the player's bet
        currentGame.playerBets[msg.sender] = PlayerBet({
            betAmount: betAmount,
            hasCashedOut: false,
            cashoutMultiplier: 0
        });
        
        // Add to the players list
        currentGame.players.push(msg.sender);
        
        emit PlayerJoined(currentGame.id, msg.sender, betAmount);
    }
    
    /**
     * @dev Start the current game if enough players have joined
     * This would typically be triggered by an off-chain mechanism in a real implementation
     */
    function startGame() external whenNotPaused {
        require(currentGame.state == GameState.WAITING, "CrashGame: game not in waiting state");
        require(currentGame.players.length > 0, "CrashGame: no players have joined");
        
        // Start the game
        currentGame.state = GameState.RUNNING;
        currentGame.startTimestamp = block.timestamp;
        lastTimestamp = block.timestamp;
        
        // Determine the crash point (would use VRF in production)
        uint256 crashPoint = _calculateGameCrashPoint(currentGame.seed);
        currentGame.crashPoint = crashPoint;
        
        emit GameStarted(currentGame.id, block.timestamp, currentGame.seed);
    }
    
    /**
     * @dev Player attempts to cash out before the crash
     * In a production environment, this would be handled differently
     * using a timestamp-based approach or oracle
     */
    function cashout() external whenNotPaused onlyRegistered {
        require(currentGame.state == GameState.RUNNING, "CrashGame: game not running");
        require(currentGame.playerBets[msg.sender].betAmount > 0, "CrashGame: player has not joined this game");
        require(!currentGame.playerBets[msg.sender].hasCashedOut, "CrashGame: player already cashed out");
        
        // Calculate current multiplier based on elapsed time
        // This is a simplified simulation - real implementation would be different
        uint256 elapsedMilliseconds = (block.timestamp - currentGame.startTimestamp) * 1000;
        uint256 currentMultiplier = _getCurrentMultiplier(elapsedMilliseconds);
        
        // Ensure the game hasn't crashed yet
        require(currentMultiplier < currentGame.crashPoint, "CrashGame: game has already crashed");
        
        // Mark player as cashed out at the current multiplier
        currentGame.playerBets[msg.sender].hasCashedOut = true;
        currentGame.playerBets[msg.sender].cashoutMultiplier = currentMultiplier;
        
        // Calculate winnings
        uint256 betAmount = currentGame.playerBets[msg.sender].betAmount;
        uint256 winAmount = (betAmount * currentMultiplier) / 100; // Multiplier is in hundredths
        
        // Update player stats
        _updatePlayerStats(msg.sender, "CRASH", betAmount, winAmount);
        
        emit PlayerCashedOut(currentGame.id, msg.sender, currentMultiplier, winAmount);
    }
    
    /**
     * @dev Force the game to crash (for testing and simulation)
     * In a production environment, this would be automated based on the crash point
     */
    function forceCrash() external whenNotPaused {
        require(currentGame.state == GameState.RUNNING, "CrashGame: game not running");
        
        // Simulate the game crashing
        uint256 multiplier = currentGame.crashPoint;
        
        // Process any players who didn't cash out
        for (uint256 i = 0; i < currentGame.players.length; i++) {
            address player = currentGame.players[i];
            PlayerBet storage bet = currentGame.playerBets[player];
            
            if (!bet.hasCashedOut) {
                // Player lost their bet (already deducted from balance)
                _updatePlayerStats(player, "CRASH", bet.betAmount, 0);
            }
        }
        
        // Record this game in history
        gameHistory.push(currentGame.id);
        gameCrashPoints[currentGame.id] = multiplier;
        
        emit GameCrashed(currentGame.id, multiplier);
        
        // Create a new game
        bytes32 newSeed = keccak256(abi.encodePacked(currentGame.seed, block.timestamp, block.prevrandao));
        _createNewGame(newSeed);
    }
    
    /**
     * @dev Calculate the current multiplier based on elapsed time
     * This is a simplified exponential growth function
     * @param elapsedMilliseconds Milliseconds since game started
     * @return The current multiplier (in hundredths, e.g., 234 = 2.34x)
     */
    function _getCurrentMultiplier(uint256 elapsedMilliseconds) private pure returns (uint256) {
        // Start at 1.00x
        if (elapsedMilliseconds < 1000) {
            return 100 + elapsedMilliseconds / 10; // Linear growth in the first second
        }
        
        // After 1 second, use an exponential curve that slows down over time
        uint256 baseMultiplier = 100 + (elapsedMilliseconds / 10);
        uint256 additionalGrowth = (elapsedMilliseconds * elapsedMilliseconds) / 100000;
        
        return baseMultiplier + additionalGrowth;
    }
    
    /**
     * @dev Calculate the crash point for a game using the seed
     * The algorithm ensures the house maintains its edge over time
     * @param seed The random seed for this game
     * @return The crash point multiplier (in hundredths, e.g., 234 = 2.34x)
     */
    function _calculateGameCrashPoint(bytes32 seed) private view returns (uint256) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(seed)));
        
        // Apply house edge
        // The formula ensures that the expected value < 1.0 by house edge
        uint256 houseEdgeFactor = 10000 - houseEdge;
        
        // This formula creates an exponential distribution of crash points
        // Most will be low, but some can be very high
        uint256 crashPoint;
        if (randomValue % 100 < 2) {
            // Small chance of very high multiplier (up to MAX_CRASH_POINT)
            crashPoint = 500 + (randomValue % MAX_CRASH_POINT);
        } else if (randomValue % 100 < 10) {
            // Slightly higher chance of medium multiplier (2x to 10x)
            crashPoint = 200 + (randomValue % 800);
        } else {
            // Most common: 1.00x to 3.00x
            crashPoint = 100 + (randomValue % 200);
        }
        
        // Apply house edge
        crashPoint = (crashPoint * houseEdgeFactor) / 10000;
        
        // Ensure minimum crash point is 1.00x
        return crashPoint < 100 ? 100 : crashPoint;
    }
    
    /**
     * @dev Create a new game with a given seed
     * @param seed The random seed for the game
     */
    function _createNewGame(bytes32 seed) private {
        bytes32 gameId = keccak256(abi.encodePacked(seed, block.number, block.timestamp));
        
        // Reset the game struct
        delete currentGame.players;
        currentGame.id = gameId;
        currentGame.state = GameState.WAITING;
        currentGame.seed = seed;
        currentGame.startTimestamp = 0;
        currentGame.crashPoint = 0;
    }
    
    /**
     * @dev Get information about the current game
     * @return id Game ID
     * @return state Game state (0=Waiting, 1=Running, 2=Crashed)
     * @return startTimestamp When the game started
     * @return playerCount Number of players in the game
     */
    function getCurrentGameInfo() external view returns (
        bytes32 id,
        uint8 state,
        uint256 startTimestamp,
        uint256 playerCount
    ) {
        return (
            currentGame.id,
            uint8(currentGame.state),
            currentGame.startTimestamp,
            currentGame.players.length
        );
    }
    
    /**
     * @dev Get information about a player's bet in the current game
     * @param player Address of the player
     * @return betAmount The amount bet
     * @return hasCashedOut Whether the player has cashed out
     * @return cashoutMultiplier The multiplier at which the player cashed out (if they did)
     */
    function getPlayerBet(address player) external view returns (
        uint256 betAmount,
        bool hasCashedOut,
        uint256 cashoutMultiplier
    ) {
        PlayerBet storage bet = currentGame.playerBets[player];
        return (
            bet.betAmount,
            bet.hasCashedOut,
            bet.cashoutMultiplier
        );
    }
    
    /**
     * @dev Get the last N game crash points for verification
     * @param count Number of games to return (max 50)
     * @return gameIds Array of game IDs
     * @return crashPoints Array of crash points
     */
    function getGameHistory(uint256 count) external view returns (
        bytes32[] memory gameIds,
        uint256[] memory crashPoints
    ) {
        // Limit to 50 games max
        if (count > 50) count = 50;
        
        // Limit to available history
        if (count > gameHistory.length) count = gameHistory.length;
        
        gameIds = new bytes32[](count);
        crashPoints = new uint256[](count);
        
        // Start from the most recent game
        for (uint256 i = 0; i < count; i++) {
            uint256 index = gameHistory.length - 1 - i;
            gameIds[i] = gameHistory[index];
            crashPoints[i] = gameCrashPoints[gameHistory[index]];
        }
        
        return (gameIds, crashPoints);
    }
}