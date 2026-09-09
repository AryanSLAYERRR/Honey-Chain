import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database.config import Base


def gen_id():
    return str(uuid.uuid4())[:8].upper()


# ===== USERS =====
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # farmer, admin, processor
    phone = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# ===== FARMS & HIVES =====
class Farm(Base):
    __tablename__ = "farms"
    id = Column(String, primary_key=True, default=gen_id)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String)
    registration_id = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    total_hives = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    hives = relationship("Hive", back_populates="farm")
    farmer = relationship("User")


class Hive(Base):
    __tablename__ = "hives"
    id = Column(String, primary_key=True, default=gen_id)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    name = Column(String, nullable=False)
    floral_source = Column(String)
    status = Column(String, default="active")  # active, alert, maintenance, inactive
    current_health = Column(Float, default=95.0)
    predicted_yield = Column(Float, default=0)
    disease_risk = Column(String, default="low")
    installed_date = Column(DateTime, default=datetime.utcnow)
    last_inspection = Column(DateTime)
    farm = relationship("Farm", back_populates="hives")
    readings = relationship("IoTReading", back_populates="hive")


# ===== IOT READINGS =====
class IoTReading(Base):
    __tablename__ = "iot_readings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hive_id = Column(String, ForeignKey("hives.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)
    humidity = Column(Float)
    weight = Column(Float)
    sound_level = Column(Float)
    activity = Column(String, default="medium")  # low, medium, high
    hive = relationship("Hive", back_populates="readings")


# ===== BATCHES =====
class Batch(Base):
    __tablename__ = "batches"
    id = Column(String, primary_key=True, default=gen_id)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    hive_id = Column(String, ForeignKey("hives.id"), nullable=False)
    floral_source = Column(String)
    harvest_date = Column(DateTime)
    quantity = Column(Float)  # kg
    status = Column(String, default="pending_verification")
    price = Column(Float)
    images = Column(JSON, default=dict)  # {honey, farm, cctv}
    iot_snapshot = Column(JSON, default=dict)  # {temp, humidity, weight, moisture}
    blockchain_tx_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    farmer = relationship("User")
    farm = relationship("Farm")
    hive = relationship("Hive")
    ai_analysis = relationship("AIAnalysis", back_populates="batch", uselist=False)


# ===== AI ANALYSIS =====
class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id = Column(String, primary_key=True, default=gen_id)
    batch_id = Column(String, ForeignKey("batches.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    hive_consistency_score = Column(Float)
    hive_consistency_passed = Column(Boolean)
    image_verification_score = Column(Float)
    image_verification_passed = Column(Boolean)
    moisture_check_score = Column(Float)
    moisture_check_passed = Column(Boolean)
    sensor_consistency_score = Column(Float)
    sensor_consistency_passed = Column(Boolean)
    yield_match_score = Column(Float)
    yield_match_passed = Column(Boolean)
    fraud_risk = Column(Float)
    recommendation = Column(String)  # approve, review, reject
    ai_insight = Column(Text)
    batch = relationship("Batch", back_populates="ai_analysis")


# ===== DRUMS =====
class Drum(Base):
    __tablename__ = "drums"
    id = Column(String, primary_key=True, default=gen_id)
    batch_id = Column(String, ForeignKey("batches.id"), nullable=False)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    weight = Column(Float)
    seal_id = Column(String)
    nfc_tag_id = Column(String)
    status = Column(String, default="sealed")
    created_at = Column(DateTime, default=datetime.utcnow)
    batch = relationship("Batch")
    farm = relationship("Farm")


# ===== TRANSPORT =====
class TransportJob(Base):
    __tablename__ = "transport_jobs"
    id = Column(String, primary_key=True, default=gen_id)
    processor_id = Column(String, ForeignKey("users.id"), nullable=False)
    vehicle_number = Column(String)
    vehicle_type = Column(String)
    driver_name = Column(String)
    driver_license = Column(String)
    driver_phone = Column(String)
    picked_up_at = Column(DateTime)
    delivered_at = Column(DateTime)
    status = Column(String, default="pending")
    seal_intact_on_delivery = Column(Boolean, default=True)
    avg_temperature = Column(Float)
    max_temperature = Column(Float)
    min_temperature = Column(Float)
    distance_km = Column(Float)
    drum_ids = Column(JSON, default=list)
    processor = relationship("User")


class TransportCheckpoint(Base):
    __tablename__ = "transport_checkpoints"
    id = Column(Integer, primary_key=True, autoincrement=True)
    transport_job_id = Column(String, ForeignKey("transport_jobs.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)
    lat = Column(Float)
    lng = Column(Float)
    seal_intact = Column(Boolean, default=True)
    note = Column(String)
    transport_job = relationship("TransportJob")


# ===== PROCESSING =====
class ProcessingBatch(Base):
    __tablename__ = "processing_batches"
    id = Column(String, primary_key=True, default=gen_id)
    processor_id = Column(String, ForeignKey("users.id"), nullable=False)
    processor_name = Column(String)
    processor_license = Column(String)
    drum_ids = Column(JSON, default=list)
    total_drums = Column(Integer)
    total_weight = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    steps = Column(JSON, default=list)
    nothing_added = Column(Boolean, default=True)
    additives = Column(JSON, default=list)
    filter_type = Column(String)
    filter_mesh_size = Column(String)
    heating_applied = Column(Boolean, default=False)
    max_heating_temp = Column(String)
    processor = relationship("User")


# ===== LAB REPORTS =====
class LabReport(Base):
    __tablename__ = "lab_reports"
    id = Column(String, primary_key=True, default=gen_id)
    processing_batch_id = Column(String, ForeignKey("processing_batches.id"), nullable=False)
    report_type = Column(String)  # pre_processing, post_processing
    lab_name = Column(String)
    lab_cert_number = Column(String)
    tested_at = Column(DateTime)
    passed = Column(Boolean)
    moisture = Column(Float)
    purity = Column(Float)
    hmf = Column(Float)
    diastase = Column(Float)
    sucrose = Column(Float)
    fructose_glucose_ratio = Column(Float)
    color = Column(String)
    taste = Column(String)
    adulterants = Column(JSON, default=list)
    pesticides = Column(JSON, default=list)
    antibiotics = Column(JSON, default=list)
    blockchain_tx_hash = Column(String)
    pdf_url = Column(String)
    processing_batch = relationship("ProcessingBatch")


# ===== BOTTLES =====
class Bottle(Base):
    __tablename__ = "bottles"
    id = Column(String, primary_key=True, default=gen_id)
    processing_batch_id = Column(String, ForeignKey("processing_batches.id"), nullable=False)
    weight = Column(Float)
    status = Column(String, default="sealed")
    seal_intact = Column(Boolean, default=True)
    nfc_tag_id = Column(String)
    nfc_cryptogram = Column(String)
    nfc_public_key = Column(String)
    nfc_scan_count = Column(Integer, default=0)
    nfc_is_authentic = Column(Boolean, default=True)
    blockchain_tx_hash = Column(String)
    blockchain_block_number = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    processing_batch = relationship("ProcessingBatch")


# ===== BLOCKCHAIN RECORDS =====
class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    tx_hash = Column(String, unique=True)
    block_number = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    from_address = Column(String)
    to_address = Column(String)
    gas_used = Column(Integer)
    data_hash = Column(String)
    status = Column(String, default="confirmed")


# ===== ORDERS / ESCROW =====
class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=gen_id)
    batch_id = Column(String, ForeignKey("batches.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    quantity = Column(Float)
    price_per_kg = Column(Float)
    total_amount = Column(Float)
    advance_paid = Column(Float)
    remaining_amount = Column(Float)
    status = Column(String, default="pending")  # pending, advance_paid, delivered, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    batch = relationship("Batch")
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
