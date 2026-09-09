from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.config import get_db
from database.models import Batch, AIAnalysis, gen_id
from datetime import datetime
from ai.fraud_detection import fraud_detector
from ai.hive_health import hive_health_model

router = APIRouter()


@router.post("/analyze/{batch_id}")
async def analyze_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Run AI fraud detection and quality analysis on a batch using real ML engine"""
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(404, "Batch not found")

    # Extract IoT snapshot values with safe defaults
    iot = batch.iot_snapshot or {}
    moisture      = float(iot.get("moisture", iot.get("humidity", 18.2)))
    hive_count    = int(iot.get("hive_count", 4))
    has_photo     = bool(batch.images)

    # Run the real fraud detection engine
    analysis = fraud_detector.evaluate_batch(
        batch_id=batch_id,
        floral_source=batch.floral_source or "Unknown",
        quantity_kg=float(batch.quantity),
        reported_moisture=moisture,
        hive_count=hive_count,
        has_harvest_photo=has_photo,
    )

    # Build a human-readable insight string
    flags_str = ", ".join(analysis["flags"]) if analysis["flags"] else "None"
    insight = (
        f"AI trust score: {analysis['ai_trust_score']}/100. "
        f"Fraud risk: {analysis['fraud_risk_score']}%. "
        f"Recommendation: {analysis['recommendation']}. "
        f"Flags: {flags_str}."
    )

    checks = analysis["checks"]

    ai = AIAnalysis(
        id=f"AI-{gen_id()}",
        batch_id=batch_id,
        hive_consistency_score=checks.get("hive_consistency", {}).get("score", 0),
        hive_consistency_passed=checks.get("hive_consistency", {}).get("passed", False),
        image_verification_score=checks.get("image_verification", {}).get("score", 0),
        image_verification_passed=checks.get("image_verification", {}).get("passed", False),
        moisture_check_score=checks.get("moisture_check", {}).get("score", 0),
        moisture_check_passed=checks.get("moisture_check", {}).get("passed", False),
        sensor_consistency_score=checks.get("sensor_consistency", {}).get("score", 0),
        sensor_consistency_passed=checks.get("sensor_consistency", {}).get("passed", False),
        yield_match_score=checks.get("yield_match", {}).get("score", 0),
        yield_match_passed=checks.get("yield_match", {}).get("passed", False),
        fraud_risk=float(analysis["fraud_risk_score"]),
        recommendation=analysis["recommendation"].lower(),
        ai_insight=insight,
    )
    db.add(ai)

    return {
        "batch_id": batch_id,
        "recommendation": analysis["recommendation"].lower(),
        "fraud_risk": analysis["fraud_risk_score"],
        "ai_trust_score": analysis["ai_trust_score"],
        "checks": checks,
        "flags": analysis["flags"],
        "insight": insight,
    }


@router.get("/analysis/{batch_id}")
async def get_analysis(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Get existing AI analysis for a batch"""
    result = await db.execute(select(AIAnalysis).where(AIAnalysis.batch_id == batch_id))
    ai = result.scalar_one_or_none()
    if not ai:
        raise HTTPException(404, "No analysis found for this batch")
    return {
        "batch_id": ai.batch_id,
        "recommendation": ai.recommendation,
        "fraud_risk": ai.fraud_risk,
        "insight": ai.ai_insight,
        "timestamp": ai.timestamp,
    }


@router.post("/hive-health/{hive_id}")
async def analyze_hive_health(hive_id: str):
    """Run hive health AI assessment for a specific hive using real HiveHealthModel"""
    import random
    # Simulated IoT reading sequence for the hive (in production, pulled from IoT DB)
    temps   = [round(random.uniform(33.0, 36.5), 1) for _ in range(6)]
    hums    = [round(random.uniform(54, 70), 1) for _ in range(6)]
    weights = [round(random.uniform(28, 50), 1) for _ in range(6)]
    sound_hz = round(random.uniform(200, 280), 1)

    result = hive_health_model.analyze_hive(
        recent_temps=temps,
        recent_hum=hums,
        recent_weights=weights,
        sound_hz=sound_hz,
    )

    return {
        "hive_id": hive_id,
        "readings": {
            "temperature_c": temps[-1],
            "humidity_pct":  hums[-1],
            "weight_kg":     weights[-1],
            "acoustic_hz":   sound_hz,
        },
        "health_score":       result.get("health_score", 85),
        "disease_risk":       result.get("disease_risk", "low"),
        "predicted_yield_kg": result.get("predicted_yield_kg", 22.0),
        "insights":           result.get("insights", []),
    }


