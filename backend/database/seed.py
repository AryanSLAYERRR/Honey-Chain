"""Seed the database with demo data matching the frontend mock data."""
import asyncio
from datetime import datetime, timedelta
from database.config import engine, async_session, Base
from database.models import (
    User, Farm, Hive, IoTReading, Batch, AIAnalysis,
    Drum, ProcessingBatch, LabReport, Bottle, BlockchainRecord, Order
)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # ===== USERS =====
        farmer = User(id="USR-FM001", name="Rajinder Sharma", role="farmer", phone="+91-98765-43210", email="rajinder@farm.in")
        admin = User(id="USR-AD001", name="Priya Verma", role="admin", phone="+91-99887-76655", email="priya@honeychain.in")
        processor = User(id="USR-PR001", name="Golden Valley Processing", role="processor", phone="+91-98111-22334", email="ops@goldenvalley.in")
        db.add_all([farmer, admin, processor])

        # ===== FARM =====
        farm = Farm(
            id="FARM-001", farmer_id="USR-FM001", name="Sharma Apiary",
            location="Phagwara, Punjab", registration_id="PB-API-2024-0847",
            lat=31.224, lng=75.768, total_hives=5
        )
        db.add(farm)

        # ===== HIVES =====
        hives_data = [
            ("H-019", "Hive Alpha", "Mustard", "active", 94.0, 32.5, "low"),
            ("H-020", "Hive Beta", "Eucalyptus", "active", 97.0, 28.0, "low"),
            ("H-021", "Hive Gamma", "Multi-flora", "alert", 78.0, 18.0, "medium"),
            ("H-022", "Hive Delta", "Mustard", "active", 91.0, 35.0, "low"),
            ("H-023", "Hive Epsilon", "Litchi", "maintenance", 65.0, 10.0, "high"),
        ]
        for hid, name, floral, status, health, yield_, risk in hives_data:
            hive = Hive(
                id=hid, farm_id="FARM-001", name=name, floral_source=floral,
                status=status, current_health=health, predicted_yield=yield_,
                disease_risk=risk, installed_date=datetime(2024, 3, 15),
                last_inspection=datetime(2026, 8, 28)
            )
            db.add(hive)

        # ===== IOT READINGS (for H-019) =====
        base_time = datetime(2026, 8, 15)
        for i in range(80):  # 20 days, 4 readings/day
            reading = IoTReading(
                hive_id="H-019",
                timestamp=base_time + timedelta(hours=i * 6),
                temperature=33.5 + (i % 5) * 0.3,
                humidity=58 + (i % 7),
                weight=38.0 + i * 0.06,
                sound_level=42 + (i % 4) * 2,
                activity="high" if i % 3 == 0 else "medium",
            )
            db.add(reading)

        # ===== BATCHES =====
        batches_data = [
            ("HC-40921", "H-019", "Mustard", 140.0, "verified", 2.1),
            ("HC-40922", "H-020", "Eucalyptus", 95.0, "pending_verification", 4.8),
            ("HC-40923", "H-021", "Multi-flora", 60.0, "listed", 1.5),
            ("HC-40924", "H-022", "Mustard", 120.0, "sold", 3.2),
            ("HC-40925", "H-019", "Mustard", 155.0, "verified", 1.8),
        ]
        for bid, hid, floral, qty, status, risk in batches_data:
            batch = Batch(
                id=bid, farmer_id="USR-FM001", farm_id="FARM-001", hive_id=hid,
                floral_source=floral, harvest_date=datetime(2026, 8, 25),
                quantity=qty, status=status, price=420.0,
                images={"honey": "/uploads/honey1.jpg", "farm": "/uploads/farm1.jpg"},
                iot_snapshot={"temperature": 34.0, "humidity": 59, "weight": 42.8, "moisture": 18.2},
            )
            db.add(batch)

            # Add AI analysis for verified batches
            if status in ("verified", "listed", "sold"):
                ai = AIAnalysis(
                    id=f"AI-{bid}", batch_id=bid,
                    hive_consistency_score=96.0, hive_consistency_passed=True,
                    image_verification_score=94.0, image_verification_passed=True,
                    moisture_check_score=98.0, moisture_check_passed=True,
                    sensor_consistency_score=95.0, sensor_consistency_passed=True,
                    yield_match_score=91.0, yield_match_passed=True,
                    fraud_risk=risk, recommendation="approve",
                    ai_insight=f"All checks passed. Fraud risk {risk}%. Batch is consistent with expected patterns.",
                )
                db.add(ai)

        # ===== PROCESSING BATCH =====
        pb = ProcessingBatch(
            id="PB-00481", processor_id="USR-PR001",
            processor_name="Golden Valley Processing",
            processor_license="FSSAI-2024-PB-1847293",
            drum_ids=["DRM-001", "DRM-002", "DRM-003"],
            total_drums=3, total_weight=420.0,
            status="complete", completed_at=datetime(2026, 9, 2),
            nothing_added=True, filter_type="Double mesh stainless steel",
            filter_mesh_size="200μm + 80μm", heating_applied=False,
        )
        db.add(pb)

        # ===== LAB REPORTS =====
        for rtype, lab_name, cert in [
            ("pre_processing", "Punjab State Food Testing Lab", "NABL-PB-2847"),
            ("post_processing", "SGS India Pvt Ltd", "NABL-DL-1293"),
        ]:
            lab = LabReport(
                processing_batch_id="PB-00481", report_type=rtype,
                lab_name=lab_name, lab_cert_number=cert,
                tested_at=datetime(2026, 9, 1), passed=True,
                moisture=17.8, purity=98.2, hmf=12.5, diastase=14.2,
                sucrose=1.8, fructose_glucose_ratio=1.15,
                color="Light Amber", taste="Mild, floral with mustard undertones",
                adulterants=[], pesticides=[], antibiotics=[],
                blockchain_tx_hash=f"0xlab{rtype[:3]}abc123def456",
            )
            db.add(lab)

        # ===== BOTTLES =====
        for i, (bid, authentic, scan_count) in enumerate([
            ("HC-BTL-000184", True, 1),
            ("HC-BTL-000185", True, 1),
            ("HC-BTL-000186", False, 3),
        ]):
            bottle = Bottle(
                id=bid, processing_batch_id="PB-00481", weight=500,
                seal_intact=authentic, nfc_tag_id=f"NFC-NTAG424-{bid[-3:]}",
                nfc_cryptogram=f"AES128:a1b2c3d4e5f6{i}789",
                nfc_public_key=f"04:ab:cd:ef:{i}0:12:34",
                nfc_scan_count=scan_count, nfc_is_authentic=authentic,
                blockchain_tx_hash=f"0xbottle{bid[-3:]}abc123",
                blockchain_block_number=18_847_293 + i,
            )
            db.add(bottle)

        # ===== BLOCKCHAIN RECORDS =====
        events = [
            ("batch_registered", "batch", "HC-40921"),
            ("ai_verified", "batch", "HC-40921"),
            ("marketplace_listed", "batch", "HC-40921"),
            ("order_created", "order", "ORD-001"),
            ("transport_started", "transport", "TRN-001"),
            ("transport_delivered", "transport", "TRN-001"),
            ("processing_started", "processing", "PB-00481"),
            ("lab_report_pre", "lab_report", "PB-00481"),
            ("lab_report_post", "lab_report", "PB-00481"),
            ("bottle_sealed", "bottle", "HC-BTL-000184"),
        ]
        for i, (event, etype, eid) in enumerate(events):
            record = BlockchainRecord(
                tx_hash=f"0x{event[:8]}{i:04d}abcdef1234567890abcdef1234567890abcdef",
                block_number=18_847_000 + i * 10,
                event_type=event, entity_type=etype, entity_id=eid,
                from_address=f"0xFarmer{i:04d}", to_address=f"0xContract{i:04d}",
                gas_used=45000 + i * 1000, data_hash=f"QmIPFS{i:04d}",
                status="confirmed",
            )
            db.add(record)

        await db.commit()
        print("✅ Database seeded successfully!")
        print("   • 3 users (farmer, admin, processor)")
        print("   • 1 farm, 5 hives")
        print("   • 80 IoT readings")
        print("   • 5 batches with AI analysis")
        print("   • 1 processing batch, 2 lab reports")
        print("   • 3 bottles (2 authentic, 1 tampered)")
        print("   • 10 blockchain records")


if __name__ == "__main__":
    asyncio.run(seed())
