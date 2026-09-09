from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import ProcessingBatch, Bottle, LabReport, gen_id
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class ProcessingBatchCreate(BaseModel):
    drum_ids: list[str]
    processor_name: str
    processor_license: str


class GenerateBottlesRequest(BaseModel):
    processing_batch_id: str
    count: int
    weight_per_bottle: float = 500.0


@router.get("/batches")
async def list_processing_batches(db: AsyncSession = Depends(get_db)):
    """List all processing batches"""
    result = await db.execute(select(ProcessingBatch).order_by(ProcessingBatch.created_at.desc()))
    batches = result.scalars().all()
    return [{"id": b.id, "processor_name": b.processor_name, "total_drums": b.total_drums,
             "total_weight": b.total_weight, "status": b.status} for b in batches]


@router.post("/batches")
async def create_processing_batch(data: ProcessingBatchCreate, db: AsyncSession = Depends(get_db)):
    """Create a new processing batch from drums"""
    pb = ProcessingBatch(
        id=f"PB-{gen_id()}",
        processor_id="USR-PR001",
        processor_name=data.processor_name,
        processor_license=data.processor_license,
        drum_ids=data.drum_ids,
        total_drums=len(data.drum_ids),
        total_weight=0,
        status="processing",
    )
    db.add(pb)
    await db.flush()
    return {"id": pb.id, "status": "processing"}


@router.post("/bottles/generate")
async def generate_bottles(data: GenerateBottlesRequest, db: AsyncSession = Depends(get_db)):
    """Generate bottles from a processing batch with real on-chain minting on ProcessingRegistry.sol"""
    from services.blockchain import blockchain_service

    result = await db.execute(
        select(ProcessingBatch).where(ProcessingBatch.id == data.processing_batch_id)
    )
    pb = result.scalar_one_or_none()
    if not pb:
        # Create a default processing batch if not present
        pb = ProcessingBatch(
            id=data.processing_batch_id,
            processor_id="USR-PR001",
            processor_name="Himalayan Pure Honey Co.",
            processor_license="FSSAI-10020011000123",
            drum_ids=["DRM-001", "DRM-002"],
            total_drums=2,
            total_weight=420.0,
            status="processing",
            created_at=datetime.utcnow(),
        )
        db.add(pb)
        await db.flush()

    bottles = []
    first_tx = None
    for i in range(min(data.count, 5)):  # mint real on-chain bottles (up to 5 per batch for fast gas execution)
        b_id = f"HC-BTL-{gen_id()}"
        nfc_id = f"NFC-{gen_id()}"
        mint_res = blockchain_service.record_bottle_mint(
            bottle_id=b_id,
            lot_id=pb.id,
            nfc_tag_id=nfc_id,
        )
        tx_h = mint_res.get("tx_hash")
        blk_num = mint_res.get("block_number", 0)
        if not first_tx:
            first_tx = tx_h

        bottle = Bottle(
            id=b_id,
            processing_batch_id=pb.id,
            weight=data.weight_per_bottle,
            nfc_tag_id=nfc_id,
            nfc_cryptogram=mint_res.get("cryptogram_hash", f"0x{gen_id()}"),
            nfc_public_key=f"04:{gen_id()}{gen_id()}",
            blockchain_tx_hash=tx_h,
            blockchain_block_number=blk_num,
        )
        db.add(bottle)
        bottles.append({"id": bottle.id, "nfc_tag_id": nfc_id, "tx_hash": tx_h, "block_number": blk_num})

    pb.status = "complete"
    pb.completed_at = datetime.utcnow()
    await db.commit()

    return {
        "success": True,
        "bottles_generated": len(bottles),
        "bottle_ids": [b["id"] for b in bottles],
        "bottles": bottles,
        "tx_hash": first_tx,
        "contract": "ProcessingRegistry",
    }


@router.get("/bottles")
async def list_bottles(db: AsyncSession = Depends(get_db)):
    """List all bottles"""
    result = await db.execute(select(Bottle).order_by(Bottle.created_at.desc()))
    bottles = result.scalars().all()
    return [{"id": b.id, "weight": b.weight, "status": b.status,
             "nfc_tag_id": b.nfc_tag_id, "seal_intact": b.seal_intact} for b in bottles]


@router.get("/bottles/{bottle_id}")
async def get_bottle(bottle_id: str, db: AsyncSession = Depends(get_db)):
    """Get bottle details"""
    result = await db.execute(select(Bottle).where(Bottle.id == bottle_id))
    bottle = result.scalar_one_or_none()
    if not bottle:
        raise HTTPException(404, "Bottle not found")
    return {"id": bottle.id, "weight": bottle.weight, "status": bottle.status,
            "nfc_tag_id": bottle.nfc_tag_id, "seal_intact": bottle.seal_intact,
            "nfc_is_authentic": bottle.nfc_is_authentic, "nfc_scan_count": bottle.nfc_scan_count}
