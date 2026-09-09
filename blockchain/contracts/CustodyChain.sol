// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CustodyChain
 * @dev Tracks custody transitions and transport checkpoints for honey drums between apiaries and processing plants.
 */
contract CustodyChain {
    enum CustodyStatus { AtFarm, Dispatched, InTransit, ReceivedAtPlant, QualityInspected }

    struct Checkpoint {
        uint256 timestamp;
        string locationName;
        bytes32 gpsCoordinatesHash;
        int16 temperatureC; // scaled by 10 (e.g. 245 = 24.5 C)
        bool sealIntact;
        string recordedBy;
    }


    struct DrumCustody {
        string drumId;
        string nfcTagId;
        address currentCustodian;
        CustodyStatus status;
        uint256 dispatchTime;
        uint256 receivedTime;
        uint256 checkpointCount;
    }

    mapping(string => DrumCustody) private drums;
    mapping(string => Checkpoint[]) private drumCheckpoints;
    string[] public allDrumIds;

    event CustodyTransferred(
        string indexed drumId,
        address indexed from,
        address indexed to,
        CustodyStatus status,
        uint256 timestamp
    );

    event CheckpointLogged(
        string indexed drumId,
        string locationName,
        int16 temperatureC,
        bool sealIntact,
        uint256 timestamp
    );

    function registerDrum(
        string calldata _drumId,
        string calldata _nfcTagId
    ) external {
        require(bytes(drums[_drumId].drumId).length == 0, "Drum already registered");

        drums[_drumId] = DrumCustody({
            drumId: _drumId,
            nfcTagId: _nfcTagId,
            currentCustodian: msg.sender,
            status: CustodyStatus.AtFarm,
            dispatchTime: 0,
            receivedTime: 0,
            checkpointCount: 0
        });

        allDrumIds.push(_drumId);
    }

    function transferCustody(
        string calldata _drumId,
        address _to,
        CustodyStatus _newStatus
    ) external {
        require(bytes(drums[_drumId].drumId).length > 0, "Drum not found");
        require(drums[_drumId].currentCustodian == msg.sender, "Caller is not current custodian");

        address previousCustodian = drums[_drumId].currentCustodian;
        drums[_drumId].currentCustodian = _to;
        drums[_drumId].status = _newStatus;

        if (_newStatus == CustodyStatus.Dispatched && drums[_drumId].dispatchTime == 0) {
            drums[_drumId].dispatchTime = block.timestamp;
        } else if (_newStatus == CustodyStatus.ReceivedAtPlant && drums[_drumId].receivedTime == 0) {
            drums[_drumId].receivedTime = block.timestamp;
        }

        emit CustodyTransferred(_drumId, previousCustodian, _to, _newStatus, block.timestamp);
    }

    function addCheckpoint(
        string calldata _drumId,
        string calldata _locationName,
        bytes32 _gpsHash,
        int16 _tempC,
        bool _sealIntact,
        string calldata _recordedBy
    ) external {
        require(bytes(drums[_drumId].drumId).length > 0, "Drum not found");

        Checkpoint memory cp = Checkpoint({
            timestamp: block.timestamp,
            locationName: _locationName,
            gpsCoordinatesHash: _gpsHash,
            temperatureC: _tempC,
            sealIntact: _sealIntact,
            recordedBy: _recordedBy
        });

        drumCheckpoints[_drumId].push(cp);
        drums[_drumId].checkpointCount++;

        emit CheckpointLogged(_drumId, _locationName, _tempC, _sealIntact, block.timestamp);
    }

    function getDrum(string calldata _drumId) external view returns (DrumCustody memory) {
        require(bytes(drums[_drumId].drumId).length > 0, "Drum not found");
        return drums[_drumId];
    }

    function getCheckpoints(string calldata _drumId) external view returns (Checkpoint[] memory) {
        return drumCheckpoints[_drumId];
    }
}
