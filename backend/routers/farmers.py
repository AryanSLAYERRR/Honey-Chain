from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import User, Farm, Hive, Batch, IoTReading
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class FarmerOut(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class FarmOut(BaseModel):
    id: str
    name: str
    location: Optional[str] = None
    registration_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    total_hives: int = 0

    class Config:
        from_attributes = True


class HiveOut(BaseModel):
    id: str
    name: str
    floral_source: Optional[str] = None
    status: str = "active"
    current_health: float = 95.0
    predicted_yield: float = 0
    disease_risk: str = "low"

    class Config:
        from_attributes = True


class FarmerStats(BaseModel):
    active_hives: int
    average_health: float
    expected_harvest: float
    total_batches: int


@router.get("/me")
async def get_farmer_profile(db: AsyncSession = Depends(get_db)):
    """Get current farmer profile (demo: returns first farmer)"""
    result = await db.execute(select(User).where(User.role == "farmer").limit(1))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "No farmer found")
    return FarmerOut.model_validate(farmer)


@router.get("/farms")
async def get_farms(db: AsyncSession = Depends(get_db)):
    """Get all farms for the current farmer"""
    result = await db.execute(select(Farm))
    farms = result.scalars().all()
    return [FarmOut.model_validate(f) for f in farms]


@router.get("/farms/{farm_id}/hives")
async def get_hives(farm_id: str, db: AsyncSession = Depends(get_db)):
    """Get all hives for a farm"""
    result = await db.execute(select(Hive).where(Hive.farm_id == farm_id))
    hives = result.scalars().all()
    return [HiveOut.model_validate(h) for h in hives]


@router.get("/hives")
async def get_all_hives(db: AsyncSession = Depends(get_db)):
    """Get all hives across all farms"""
    result = await db.execute(select(Hive))
    hives = result.scalars().all()
    return [HiveOut.model_validate(h) for h in hives]


@router.get("/stats")
async def get_farmer_stats(db: AsyncSession = Depends(get_db)):
    """Get farmer dashboard stats"""
    hives = (await db.execute(select(Hive))).scalars().all()
    batches = (await db.execute(select(Batch))).scalars().all()
    active = [h for h in hives if h.status == "active"]
    avg_health = sum(h.current_health for h in hives) / max(len(hives), 1)
    harvest = sum(h.predicted_yield for h in active)
    return FarmerStats(
        active_hives=len(active),
        average_health=round(avg_health, 1),
        expected_harvest=round(harvest, 1),
        total_batches=len(batches),
    )
