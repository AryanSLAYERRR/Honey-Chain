from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import Batch, AIAnalysis, gen_id
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from services.blockchain import blockchain_service

router = APIRouter()


class BatchCreate(BaseModel):
    batch_id: Optional[str] = None
    farm_id: str = "FARM-001"
    hive_id: str = "HIVE-001"
    floral_source: str
    harvest_date: str = datetime.utcnow().isoformat()
    quantity: float
    images: dict = {}
    iot_snapshot: dict = {}
    price: Optional[float] = None


class BatchOut(BaseModel):
    id: str
    farmer_id: str
    farm_id: str
    hive_id: str
    floral_source: Optional[str] = None
    harvest_date: Optional[datetime] = None
    quantity: float
    status: str
    price: Optional[float] = None
    blockchain_tx_hash: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/")
async def list_batches(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """List all batches, optionally filtered by status"""
    query = select(Batch)
    if status:
        query = query.where(Batch.status == status)
    result = await db.execute(query.order_by(Batch.created_at.desc()))
    batches = result.scalars().all()
    return [BatchOut.model_validate(b) for b in batches]


@router.post("/", response_model=BatchOut)
async def create_batch(data: BatchCreate, db: AsyncSession = Depends(get_db)):
    """Create a new honey batch and record on blockchain"""
    batch_id = data.batch_id or f"HC-{gen_id()}"

    # Record batch registration on blockchain (real web3 call or deterministic hash)
    chain_result = blockchain_service.record_batch_registration(
        batch_id=batch_id,
        farmer_id="USR-FM001",
        hive_id=data.hive_id,
        quantity_kg=data.quantity,
    )

    try:
        h_date = datetime.fromisoformat(data.harvest_date)
    except Exception:
        h_date = datetime.utcnow()

    batch = Batch(
        id=batch_id,
        farmer_id="USR-FM001",  # demo: hardcoded farmer
        farm_id=data.farm_id,
        hive_id=data.hive_id,
        floral_source=data.floral_source,
        harvest_date=h_date,
        quantity=data.quantity,
        status="pending_verification",
        price=data.price or 420.0,
        images=data.images,
        iot_snapshot=data.iot_snapshot,
        blockchain_tx_hash=chain_result.get("tx_hash"),
    )
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return BatchOut.model_validate(batch)


@router.get("/{batch_id}")
async def get_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Get batch details by ID"""
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(404, "Batch not found")
    return BatchOut.model_validate(batch)


@router.patch("/{batch_id}/approve")
@router.post("/{batch_id}/approve")
async def approve_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Admin approves a batch — triggers verifyBatch() on BatchRegistry smart contract"""
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        # Create batch if it doesn't exist yet
        batch = Batch(
            id=batch_id,
            farmer_id="USR-FM001",
            hive_id="HIV-001",
            floral_source="Mustard & Wildflower",
            quantity=180.0,
            moisture_content=17.2,
            status="pending_verification",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(batch)
        await db.flush()
        # Register batch on-chain first
        blockchain_service.record_batch_registration(
            batch_id=batch_id,
            farmer_id=batch.farmer_id,
            hive_id=batch.hive_id,
            quantity_kg=batch.quantity,
        )

    # Call blockchain service to record verification (calls verifyBatch on-chain)
    chain_result = blockchain_service.record_verification(
        batch_id=batch_id,
        ai_trust_score=87,   # Default high score for approved batches
        approved=True,
    )

    batch.status = "verified"
    batch.updated_at = datetime.utcnow()
    batch.blockchain_tx_hash = chain_result.get("tx_hash")
    await db.commit()

    return {
        "status": "verified",
        "tx_hash": batch.blockchain_tx_hash,
        "block_number": chain_result.get("block_number"),
        "ai_trust_score": chain_result.get("ai_trust_score"),
        "network": chain_result.get("network", "Hardhat Local EVM"),
    }


@router.patch("/{batch_id}/reject")
@router.post("/{batch_id}/reject")
async def reject_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Admin rejects a batch"""
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        batch = Batch(
            id=batch_id,
            farmer_id="USR-FM001",
            hive_id="HIV-001",
            floral_source="Mustard & Wildflower",
            quantity=180.0,
            moisture_content=19.5,
            status="pending_verification",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(batch)
        await db.flush()

    batch.status = "rejected"
    batch.updated_at = datetime.utcnow()

    # Record rejection on-chain
    chain_result = blockchain_service.record_verification(
        batch_id=batch_id,
        ai_trust_score=0,
        approved=False,
    )
    batch.blockchain_tx_hash = chain_result.get("tx_hash")
    await db.commit()

    return {"status": "rejected", "tx_hash": batch.blockchain_tx_hash, "block_number": chain_result.get("block_number")}

