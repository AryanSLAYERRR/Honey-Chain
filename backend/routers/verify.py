from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import Bottle
from datetime import datetime

router = APIRouter()


@router.get("/{bottle_id}")
async def verify_bottle(bottle_id: str, db: AsyncSession = Depends(get_db)):
    """Public consumer verification endpoint — no auth required.
    Returns full bottle lineage for the consumer verification page."""
    result = await db.execute(select(Bottle).where(Bottle.id == bottle_id))
    bottle = result.scalar_one_or_none()
    if not bottle:
        raise HTTPException(404, detail="Bottle not found")

    # Increment scan count
    bottle.nfc_scan_count = (bottle.nfc_scan_count or 0) + 1

    # Build response with full lineage
    return {
        "id": bottle.id,
        "weight": bottle.weight,
        "status": bottle.status,
        "seal_intact": bottle.seal_intact,
        "nfc": {
            "tag_id": bottle.nfc_tag_id,
            "cryptogram": bottle.nfc_cryptogram,
            "public_key": bottle.nfc_public_key,
            "scan_count": bottle.nfc_scan_count,
            "is_authentic": bottle.nfc_is_authentic,
        },
        "blockchain": {
            "tx_hash": bottle.blockchain_tx_hash,
            "block_number": bottle.blockchain_block_number,
        },
        "processing_batch_id": bottle.processing_batch_id,
        "created_at": bottle.created_at,
        "verified_at": datetime.utcnow().isoformat(),
    }
