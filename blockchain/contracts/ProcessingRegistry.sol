// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProcessingRegistry
 * @dev Manages blending source drums into processing batches, dual lab reports, and bottle minting with NFC cryptograms.
 */
contract ProcessingRegistry {
    struct ProcessingLot {
        string lotId;
        string processorId;
        string[] sourceDrumIds;
        bytes32 preLabReportHash;
        bytes32 postLabReportHash;
        uint256 totalWeightKg;
        uint256 bottleCount;
        uint256 createdAt;
        bool fssaiCompliant;
    }

    struct BottleRecord {
        string bottleId;
        string lotId;
        string nfcTagId;
        bytes32 nfcCryptogramHash;
        uint256 scanCount;
        bool isRevoked;
        uint256 mintedAt;
    }

    address public admin;
    mapping(string => ProcessingLot) private lots;
    mapping(string => BottleRecord) private bottles;
    mapping(string => bool) private usedNfcTags;

    event LotCreated(
        string indexed lotId,
        string processorId,
        uint256 totalWeightKg,
        uint256 drumCount,
        bytes32 preLabReportHash,
        bytes32 postLabReportHash
    );

    event BottleRegistered(
        string indexed bottleId,
        string indexed lotId,
        string nfcTagId,
        bytes32 nfcCryptogramHash
    );

    event BottleScanned(
        string indexed bottleId,
        uint256 newScanCount,
        bool isAuthentic
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createProcessingLot(
        string calldata _lotId,
        string calldata _processorId,
        string[] calldata _sourceDrumIds,
        bytes32 _preLabHash,
        bytes32 _postLabHash,
        uint256 _totalWeightKg,
        bool _fssaiCompliant
    ) external {
        require(bytes(lots[_lotId].lotId).length == 0, "Lot already exists");

        lots[_lotId] = ProcessingLot({
            lotId: _lotId,
            processorId: _processorId,
            sourceDrumIds: _sourceDrumIds,
            preLabReportHash: _preLabHash,
            postLabReportHash: _postLabHash,
            totalWeightKg: _totalWeightKg,
            bottleCount: 0,
            createdAt: block.timestamp,
            fssaiCompliant: _fssaiCompliant
        });

        emit LotCreated(
            _lotId,
            _processorId,
            _totalWeightKg,
            _sourceDrumIds.length,
            _preLabHash,
            _postLabHash
        );
    }

    function registerBottle(
        string calldata _bottleId,
        string calldata _lotId,
        string calldata _nfcTagId,
        bytes32 _nfcCryptogramHash
    ) external {
        require(bytes(lots[_lotId].lotId).length > 0, "Processing lot does not exist");
        require(bytes(bottles[_bottleId].bottleId).length == 0, "Bottle already registered");
        require(!usedNfcTags[_nfcTagId], "NFC Tag ID already assigned to another bottle");

        bottles[_bottleId] = BottleRecord({
            bottleId: _bottleId,
            lotId: _lotId,
            nfcTagId: _nfcTagId,
            nfcCryptogramHash: _nfcCryptogramHash,
            scanCount: 0,
            isRevoked: false,
            mintedAt: block.timestamp
        });

        usedNfcTags[_nfcTagId] = true;
        lots[_lotId].bottleCount++;

        emit BottleRegistered(_bottleId, _lotId, _nfcTagId, _nfcCryptogramHash);
    }

    function logBottleScan(string calldata _bottleId) external returns (bool authentic) {
        require(bytes(bottles[_bottleId].bottleId).length > 0, "Bottle not found");

        bottles[_bottleId].scanCount++;
        bool isAuth = !bottles[_bottleId].isRevoked && bottles[_bottleId].scanCount <= 3;

        emit BottleScanned(_bottleId, bottles[_bottleId].scanCount, isAuth);
        return isAuth;
    }

    function getLot(string calldata _lotId) external view returns (ProcessingLot memory) {
        require(bytes(lots[_lotId].lotId).length > 0, "Lot does not exist");
        return lots[_lotId];
    }

    function getBottle(string calldata _bottleId) external view returns (BottleRecord memory) {
        require(bytes(bottles[_bottleId].bottleId).length > 0, "Bottle does not exist");
        return bottles[_bottleId];
    }
}
