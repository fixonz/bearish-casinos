
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PrizeBuilder {
    struct Pool {
        uint256 totalPrize;
        uint256 minEntry;
        uint256 maxEntry;
        uint256 endTime;
        address[] participants;
        bool completed;
    }

    Pool[] public pools;
    mapping(uint256 => mapping(address => uint256)) public entries;

    event PoolCreated(uint256 poolId, uint256 minEntry, uint256 maxEntry, uint256 endTime);
    event EntryAdded(uint256 poolId, address participant, uint256 amount);
    event PrizeDistributed(uint256 poolId, address[] winners, uint256[] amounts);

    function createPool(uint256 _minEntry, uint256 _maxEntry, uint256 duration) external {
        require(_minEntry >= 0.0025 ether, "Min entry too low");
        require(_maxEntry <= 0.5 ether, "Max entry too high");
        
        pools.push(Pool({
            totalPrize: 0,
            minEntry: _minEntry,
            maxEntry: _maxEntry,
            endTime: block.timestamp + duration,
            participants: new address[](0),
            completed: false
        }));

        emit PoolCreated(pools.length - 1, _minEntry, _maxEntry, block.timestamp + duration);
    }

    function enterPool(uint256 poolId) external payable {
        Pool storage pool = pools[poolId];
        require(!pool.completed, "Pool completed");
        require(block.timestamp < pool.endTime, "Pool ended");
        require(msg.value >= pool.minEntry, "Entry too low");
        require(msg.value <= pool.maxEntry, "Entry too high");

        if (entries[poolId][msg.sender] == 0) {
            pool.participants.push(msg.sender);
        }
        
        entries[poolId][msg.sender] += msg.value;
        pool.totalPrize += msg.value;

        emit EntryAdded(poolId, msg.sender, msg.value);
    }

    function distributePrizes(uint256 poolId) external {
        Pool storage pool = pools[poolId];
        require(block.timestamp >= pool.endTime, "Pool not ended");
        require(!pool.completed, "Already distributed");
        require(pool.participants.length > 0, "No participants");

        pool.completed = true;
        uint256 totalPrize = pool.totalPrize;
        
        // Select up to 3 winners based on random selection
        uint256 winnerCount = pool.participants.length > 3 ? 3 : pool.participants.length;
        address[] memory winners = new address[](winnerCount);
        uint256[] memory prizes = new uint256[](winnerCount);
        
        // Simplified random selection for demo (would use Chainlink VRF in production)
        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 index = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                i
            ))) % pool.participants.length;
            
            winners[i] = pool.participants[index];
            prizes[i] = (totalPrize * (winnerCount - i)) / (winnerCount * 2);
            
            payable(winners[i]).transfer(prizes[i]);
        }

        emit PrizeDistributed(poolId, winners, prizes);
    }
}
