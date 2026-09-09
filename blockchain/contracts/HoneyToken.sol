// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HoneyToken ($HONEY)
 * @dev ERC-20 token for the HoneyChain decentralized provenance ecosystem.
 * Supports quality staking, proof-of-pollination rewards, and fee-free escrow settlement.
 */
contract HoneyToken {
    string public name = "HoneyChain Token";
    string public symbol = "HONEY";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Quality staking tracking
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    mapping(string => Stake) public batchStakes; // batchId => Stake
    mapping(string => address) public batchFarmer;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event QualityStakePlaced(string indexed batchId, address indexed farmer, uint256 amount);
    event QualityStakeReleased(string indexed batchId, address indexed farmer, uint256 amount);
    event QualityStakeSlashed(string indexed batchId, address indexed farmer, uint256 amount, string reason);
    event PollinationReward(address indexed beekeeper, string indexed hiveId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "HoneyToken: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Mint initial supply of 10,000,000 $HONEY to deployer
        _mint(msg.sender, 10_000_000 * 10**decimals);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= value, "HoneyToken: insufficient allowance");
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "HoneyToken: transfer to zero address");
        require(balanceOf[from] >= value, "HoneyToken: insufficient balance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "HoneyToken: mint to zero address");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function mint(address to, uint256 value) external onlyOwner {
        _mint(to, value);
    }

    /**
     * @notice Stake tokens when registering a harvest batch.
     */
    function stakeForBatch(string calldata batchId, uint256 amount) external {
        require(amount > 0, "HoneyToken: stake must be > 0");
        require(!batchStakes[batchId].active, "HoneyToken: batch already staked");
        
        _transfer(msg.sender, address(this), amount);
        batchStakes[batchId] = Stake({
            amount: amount,
            timestamp: block.timestamp,
            active: true
        });
        batchFarmer[batchId] = msg.sender;

        emit QualityStakePlaced(batchId, msg.sender, amount);
    }

    /**
     * @notice Release stake back to the farmer after NABL lab testing passes.
     */
    function releaseStake(string calldata batchId) external onlyOwner {
        Stake storage st = batchStakes[batchId];
        require(st.active, "HoneyToken: no active stake for batch");
        address farmer = batchFarmer[batchId];

        st.active = false;
        _transfer(address(this), farmer, st.amount);

        emit QualityStakeReleased(batchId, farmer, st.amount);
    }

    /**
     * @notice Slash farmer stake if lab or AI detects sugar syrup or adulteration.
     */
    function slashStake(string calldata batchId, string calldata reason) external onlyOwner {
        Stake storage st = batchStakes[batchId];
        require(st.active, "HoneyToken: no active stake for batch");
        address farmer = batchFarmer[batchId];

        st.active = false;
        // Slashed tokens sent to ecosystem reserve / owner
        _transfer(address(this), owner, st.amount);

        emit QualityStakeSlashed(batchId, farmer, st.amount, reason);
    }

    /**
     * @notice Reward beekeeper for maintaining optimal colony telemetry.
     */
    function distributePollinationReward(address beekeeper, string calldata hiveId, uint256 amount) external onlyOwner {
        _mint(beekeeper, amount);
        emit PollinationReward(beekeeper, hiveId, amount);
    }
}
