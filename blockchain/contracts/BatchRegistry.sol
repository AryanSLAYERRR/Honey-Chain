// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BatchRegistry
 * @dev Records farmer honey batches, IoT sensor snapshots, and AI trust verification on-chain.
 */
contract BatchRegistry {
    enum BatchStatus { Draft, Submitted, Verified, Rejected, Processing, Bottled }

    struct BatchRecord {
        string batchId;
        string farmerId;
        string hiveId;
        string floralSource;
        uint256 quantityKg;
        uint256 harvestTimestamp;
        bytes32 dataHash; // SHA-256 of sensor telemetry & harvest logs
        uint8 aiTrustScore; // 0 - 100
        BatchStatus status;
        address registeredBy;
    }

    address public admin;
    mapping(string => BatchRecord) private batches;
    string[] public allBatchIds;

    event BatchRegistered(
        string indexed batchId,
        string farmerId,
        string hiveId,
        uint256 quantityKg,
        bytes32 dataHash,
        address indexed registeredBy
    );

    event BatchVerified(
        string indexed batchId,
        uint8 aiTrustScore,
        BatchStatus status,
        address indexed verifiedBy
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "BatchRegistry: caller is not the admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerBatch(
        string calldata _batchId,
        string calldata _farmerId,
        string calldata _hiveId,
        string calldata _floralSource,
        uint256 _quantityKg,
        bytes32 _dataHash
    ) external {
        require(bytes(batches[_batchId].batchId).length == 0, "Batch already exists");

        batches[_batchId] = BatchRecord({
            batchId: _batchId,
            farmerId: _farmerId,
            hiveId: _hiveId,
            floralSource: _floralSource,
            quantityKg: _quantityKg,
            harvestTimestamp: block.timestamp,
            dataHash: _dataHash,
            aiTrustScore: 0,
            status: BatchStatus.Submitted,
            registeredBy: msg.sender
        });

        allBatchIds.push(_batchId);

        emit BatchRegistered(
            _batchId,
            _farmerId,
            _hiveId,
            _quantityKg,
            _dataHash,
            msg.sender
        );
    }

    function verifyBatch(
        string calldata _batchId,
        uint8 _aiTrustScore,
        bool _approve
    ) external onlyAdmin {
        require(bytes(batches[_batchId].batchId).length > 0, "Batch does not exist");
        require(batches[_batchId].status == BatchStatus.Submitted, "Invalid batch state");

        batches[_batchId].aiTrustScore = _aiTrustScore;
        batches[_batchId].status = _approve ? BatchStatus.Verified : BatchStatus.Rejected;

        emit BatchVerified(_batchId, _aiTrustScore, batches[_batchId].status, msg.sender);
    }

    function getBatch(string calldata _batchId) external view returns (BatchRecord memory) {
        require(bytes(batches[_batchId].batchId).length > 0, "Batch does not exist");
        return batches[_batchId];
    }

    function getTotalBatches() external view returns (uint256) {
        return allBatchIds.length;
    }
}
