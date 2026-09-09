from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import IoTReading, Hive, gen_id
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class IoTDataIn(BaseModel):
    hive_id: str
    temperature: float
    humidity: float
    weight: float
    sound_level: float = 45.0
    activity: str = "medium"


@router.post("/readings")
async def ingest_reading(data: IoTDataIn, db: AsyncSession = Depends(get_db)):
    """Ingest a new IoT sensor reading from a hive"""
    reading = IoTReading(
        hive_id=data.hive_id,
        temperature=data.temperature,
        humidity=data.humidity,
        weight=data.weight,
        sound_level=data.sound_level,
        activity=data.activity,
    )
    db.add(reading)
    return {"status": "recorded", "hive_id": data.hive_id, "timestamp": datetime.utcnow()}


@router.get("/readings/{hive_id}")
async def get_readings(hive_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Get recent IoT readings for a hive"""
    result = await db.execute(
        select(IoTReading)
        .where(IoTReading.hive_id == hive_id)
        .order_by(IoTReading.timestamp.desc())
        .limit(limit)
    )
    readings = result.scalars().all()
    return [{"timestamp": r.timestamp, "temperature": r.temperature,
             "humidity": r.humidity, "weight": r.weight,
             "sound_level": r.sound_level, "activity": r.activity} for r in readings]


@router.get("/hive/{hive_id}/latest")
async def get_latest_reading(hive_id: str, db: AsyncSession = Depends(get_db)):
    """Get the most recent reading for a hive"""
    result = await db.execute(
        select(IoTReading)
        .where(IoTReading.hive_id == hive_id)
        .order_by(IoTReading.timestamp.desc())
        .limit(1)
    )
    reading = result.scalar_one_or_none()
    if not reading:
        return {"status": "no_data", "hive_id": hive_id}
    return {"temperature": reading.temperature, "humidity": reading.humidity,
            "weight": reading.weight, "sound_level": reading.sound_level,
            "activity": reading.activity, "timestamp": reading.timestamp}
