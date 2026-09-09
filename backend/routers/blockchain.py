from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import BlockchainRecord
from services.blockchain import blockchain_service

router = APIRouter()


@router.get("/node-status")
async def node_status():
    """Live status of Hardhat EVM RPC and Smart Contracts."""
    status = {
        "connected": blockchain_service.is_connected,
        "rpc_url": "http://127.0.0.1:8545",
        "chain_id": 31337,
        "network_name": "Hardhat Local EVM",
        "contracts": blockchain_service.contracts,
        "latest_block": 0,
        "relayer_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "relayer_balance_eth": 10000.0,
    }
    if blockchain_service.is_connected:
        try:
            status["latest_block"] = blockchain_service.w3.eth.block_number
            bal = blockchain_service.w3.eth.get_balance(status["relayer_address"])
            status["relayer_balance_eth"] = float(blockchain_service.w3.from_wei(bal, "ether"))
        except Exception:
            pass
    return status


@router.get("/records")
async def list_records(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """List recent blockchain records from DB"""
    result = await db.execute(
        select(BlockchainRecord).order_by(BlockchainRecord.timestamp.desc()).limit(limit)
    )
    records = result.scalars().all()
    return [{
        "id": r.id,
        "tx_hash": r.tx_hash,
        "block_number": r.block_number,
        "event_type": r.event_type,
        "entity_type": r.entity_type,
        "entity_id": r.entity_id,
        "from_address": r.from_address,
        "to_address": r.to_address,
        "gas_used": r.gas_used,
        "timestamp": r.timestamp,
        "status": r.status or "confirmed",
    } for r in records]


@router.get("/records/{tx_hash}")
async def get_record(tx_hash: str, db: AsyncSession = Depends(get_db)):
    """Get a single blockchain record by tx hash"""
    result = await db.execute(select(BlockchainRecord).where(BlockchainRecord.tx_hash == tx_hash))
    record = result.scalar_one_or_none()
    if not record:
        # Fallback check on chain if connected
        if blockchain_service.is_connected:
            try:
                receipt = blockchain_service.w3.eth.get_transaction_receipt(tx_hash)
                if receipt:
                    return {
                        "id": 9999,
                        "tx_hash": tx_hash,
                        "block_number": receipt.blockNumber,
                        "event_type": "CONTRACT_INTERACTION",
                        "entity_type": "evm_tx",
                        "entity_id": tx_hash[:10],
                        "from_address": receipt.get("from", ""),
                        "to_address": receipt.get("to", ""),
                        "gas_used": receipt.gasUsed,
                        "data_hash": None,
                        "status": "confirmed" if receipt.status == 1 else "failed",
                    }
            except Exception:
                pass
        return {"error": "Transaction not found"}
    return {
        "id": record.id,
        "tx_hash": record.tx_hash,
        "block_number": record.block_number,
        "event_type": record.event_type,
        "entity_type": record.entity_type,
        "entity_id": record.entity_id,
        "from_address": record.from_address,
        "to_address": record.to_address,
        "gas_used": record.gas_used,
        "data_hash": record.data_hash,
        "timestamp": record.timestamp,
        "status": record.status,
    }


@router.get("/stats")
async def blockchain_stats(db: AsyncSession = Depends(get_db)):
    """Get blockchain statistics"""
    result = await db.execute(select(BlockchainRecord))
    records = result.scalars().all()
    latest_block = 0
    if blockchain_service.is_connected:
        try:
            latest_block = blockchain_service.w3.eth.block_number
        except Exception:
            pass
    return {
        "total_transactions": len(records),
        "total_gas_used": sum(r.gas_used or 0 for r in records),
        "event_types": list(set(r.event_type for r in records if r.event_type)),
        "is_connected": blockchain_service.is_connected,
        "latest_block": latest_block or (records[0].block_number if records else 1),
    }
