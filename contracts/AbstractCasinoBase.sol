// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AbstractCasinoBase
 * @dev Base contract for Abstract Network-compatible casino games
 * This contract handles common functionality for casino games including:
 * - Player registration and management
 * - Token deposits and withdrawals
 * - Access control
 * - Fee collection
 * - House edge management
 */
contract AbstractCasinoBase {
    // ============ Events ============
    event PlayerRegistered(address indexed player, string username);
    event Deposit(address indexed player, uint256 amount);
    event Withdrawal(address indexed player, uint256 amount);
    event GamePlayed(address indexed player, string gameId, uint256 betAmount, uint256 winAmount, int256 profitLoss);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FeeCollected(uint256 amount);
    
    // ============ State Variables ============
    address public owner;
    uint256 public houseEdge; // Represented as basis points (e.g., 250 = 2.5%)
    uint256 public minBet;
    uint256 public maxBet;
    bool public paused;
    
    struct Player {
        string username;
        uint256 balance;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 gamesPlayed;
        bool exists;
    }
    
    // Player registry
    mapping(address => Player) public players;
    
    // Fee collection
    uint256 public accumulatedFees;
    
    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "AbstractCasinoBase: caller is not the owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "AbstractCasinoBase: contract is paused");
        _;
    }
    
    modifier onlyRegistered() {
        require(players[msg.sender].exists, "AbstractCasinoBase: player not registered");
        _;
    }
    
    /**
     * @dev Constructor to initialize the contract with default values
     * @param _houseEdge The house edge in basis points (e.g., 250 = 2.5%)
     * @param _minBet The minimum bet amount
     * @param _maxBet The maximum bet amount
     */
    constructor(uint256 _houseEdge, uint256 _minBet, uint256 _maxBet) {
        owner = msg.sender;
        houseEdge = _houseEdge;
        minBet = _minBet;
        maxBet = _maxBet;
        paused = false;
    }
    
    // ============ Owner Functions ============
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "AbstractCasinoBase: new owner is the zero address");
        address previousOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }
    
    /**
     * @dev Update the house edge
     * @param _houseEdge The new house edge in basis points
     */
    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        houseEdge = _houseEdge;
    }
    
    /**
     * @dev Update bet limits
     * @param _minBet The new minimum bet
     * @param _maxBet The new maximum bet
     */
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet <= _maxBet, "AbstractCasinoBase: min bet must be <= max bet");
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    /**
     * @dev Pause or unpause the contract
     * @param _paused Whether the contract should be paused
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    /**
     * @dev Withdraw accumulated fees to the owner
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        
        // Transfer funds logic would be implemented here
        // Typically using a safe transfer method
        
        emit FeeCollected(amount);
    }
    
    // ============ Player Functions ============
    
    /**
     * @dev Register a new player
     * @param _username The player's chosen username
     */
    function registerPlayer(string memory _username) external {
        require(!players[msg.sender].exists, "AbstractCasinoBase: player already registered");
        require(bytes(_username).length > 0, "AbstractCasinoBase: username cannot be empty");
        
        players[msg.sender] = Player({
            username: _username,
            balance: 0,
            totalWagered: 0,
            totalWon: 0,
            gamesPlayed: 0,
            exists: true
        });
        
        emit PlayerRegistered(msg.sender, _username);
    }
    
    /**
     * @dev Deposit funds to the player's balance
     */
    function deposit() external payable whenNotPaused onlyRegistered {
        require(msg.value > 0, "AbstractCasinoBase: deposit amount must be positive");
        
        players[msg.sender].balance += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds from the player's balance
     * @param _amount The amount to withdraw
     */
    function withdraw(uint256 _amount) external whenNotPaused onlyRegistered {
        require(_amount > 0, "AbstractCasinoBase: withdrawal amount must be positive");
        require(players[msg.sender].balance >= _amount, "AbstractCasinoBase: insufficient balance");
        
        players[msg.sender].balance -= _amount;
        
        // Transfer funds logic would be implemented here
        // Typically using a safe transfer method
        
        emit Withdrawal(msg.sender, _amount);
    }
    
    /**
     * @dev Get player information
     * @param _player The address of the player
     * @return Player information
     */
    function getPlayerInfo(address _player) external view returns (
        string memory username,
        uint256 balance,
        uint256 totalWagered,
        uint256 totalWon,
        uint256 gamesPlayed
    ) {
        require(players[_player].exists, "AbstractCasinoBase: player not registered");
        Player memory player = players[_player];
        
        return (
            player.username,
            player.balance,
            player.totalWagered,
            player.totalWon,
            player.gamesPlayed
        );
    }
    
    /**
     * @dev Internal function to update player stats after a game
     * @param _player The address of the player
     * @param _gameId The ID of the game played
     * @param _betAmount The amount bet
     * @param _winAmount The amount won (0 if lost)
     */
    function _updatePlayerStats(
        address _player,
        string memory _gameId,
        uint256 _betAmount,
        uint256 _winAmount
    ) internal {
        Player storage player = players[_player];
        
        // Update player stats
        player.totalWagered += _betAmount;
        player.totalWon += _winAmount;
        player.gamesPlayed += 1;
        
        // Calculate profit/loss
        int256 profitLoss = int256(_winAmount) - int256(_betAmount);
        
        // If player won, add winnings to balance
        if (_winAmount > 0) {
            player.balance += _winAmount - _betAmount; // Add the profit (already subtracted bet amount during play)
        }
        
        // Calculate and accumulate fee if the player lost
        if (_winAmount < _betAmount) {
            // Fee already collected as part of house edge when player loses
            uint256 fee = (_betAmount * houseEdge) / 10000;
            accumulatedFees += fee;
        }
        
        emit GamePlayed(_player, _gameId, _betAmount, _winAmount, profitLoss);
    }
    
    /**
     * @dev Verify that a bet is valid
     * @param _betAmount The amount being bet
     */
    function _validateBet(uint256 _betAmount) internal view returns (bool) {
        require(!paused, "AbstractCasinoBase: contract is paused");
        require(_betAmount >= minBet, "AbstractCasinoBase: bet amount below minimum");
        require(_betAmount <= maxBet, "AbstractCasinoBase: bet amount above maximum");
        require(players[msg.sender].balance >= _betAmount, "AbstractCasinoBase: insufficient balance");
        
        return true;
    }
    
    /**
     * @dev Internal function to place a bet
     * @param _betAmount The amount being bet
     */
    function _placeBet(uint256 _betAmount) internal {
        require(_validateBet(_betAmount), "AbstractCasinoBase: invalid bet");
        
        // Deduct bet amount from player balance
        players[msg.sender].balance -= _betAmount;
    }
}