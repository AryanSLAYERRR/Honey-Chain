// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Escrow
 * @dev 85/15 B2B payment escrow for verified honey marketplace orders.
 * 85% upfront released upon dispatch; 15% quality reserve released after lab verification.
 */
contract Escrow {
    enum EscrowStatus { Created, AdvanceReleased, Completed, Refunded }

    struct OrderEscrow {
        string orderId;
        string batchId;
        address buyer;
        address payable seller;
        uint256 totalAmount;
        uint256 advanceAmount; // 85%
        uint256 reserveAmount; // 15%
        EscrowStatus status;
        uint256 createdAt;
    }

    address public arbiter;
    mapping(string => OrderEscrow) private escrows;

    event EscrowCreated(string indexed orderId, string indexed batchId, address buyer, address seller, uint256 total);
    event AdvanceReleased(string indexed orderId, uint256 amount);
    event EscrowCompleted(string indexed orderId, uint256 remainingAmount);
    event EscrowRefunded(string indexed orderId, uint256 refundAmount);

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Caller is not arbiter");
        _;
    }

    constructor() {
        arbiter = msg.sender;
    }

    function createEscrow(
        string calldata _orderId,
        string calldata _batchId,
        address payable _seller
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(escrows[_orderId].totalAmount == 0, "Escrow already exists");

        uint256 advance = (msg.value * 85) / 100;
        uint256 reserve = msg.value - advance;

        escrows[_orderId] = OrderEscrow({
            orderId: _orderId,
            batchId: _batchId,
            buyer: msg.sender,
            seller: _seller,
            totalAmount: msg.value,
            advanceAmount: advance,
            reserveAmount: reserve,
            status: EscrowStatus.Created,
            createdAt: block.timestamp
        });

        emit EscrowCreated(_orderId, _batchId, msg.sender, _seller, msg.value);
    }

    function releaseAdvance(string calldata _orderId) external {
        OrderEscrow storage e = escrows[_orderId];
        require(e.status == EscrowStatus.Created, "Invalid status");
        require(msg.sender == e.buyer || msg.sender == arbiter, "Not authorized");

        e.status = EscrowStatus.AdvanceReleased;
        e.seller.transfer(e.advanceAmount);

        emit AdvanceReleased(_orderId, e.advanceAmount);
    }

    function releaseReserve(string calldata _orderId) external {
        OrderEscrow storage e = escrows[_orderId];
        require(e.status == EscrowStatus.AdvanceReleased, "Advance not released yet");
        require(msg.sender == e.buyer || msg.sender == arbiter, "Not authorized");

        e.status = EscrowStatus.Completed;
        e.seller.transfer(e.reserveAmount);

        emit EscrowCompleted(_orderId, e.reserveAmount);
    }

    function refundRemaining(string calldata _orderId) external onlyArbiter {
        OrderEscrow storage e = escrows[_orderId];
        require(e.status == EscrowStatus.AdvanceReleased, "Cannot refund");

        e.status = EscrowStatus.Refunded;
        payable(e.buyer).transfer(e.reserveAmount);

        emit EscrowRefunded(_orderId, e.reserveAmount);
    }

    function getEscrow(string calldata _orderId) external view returns (OrderEscrow memory) {
        return escrows[_orderId];
    }
}
