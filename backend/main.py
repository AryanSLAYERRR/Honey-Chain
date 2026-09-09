from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.config import engine, Base
from routers import farmers, batches, marketplace, processing, verify, iot, ai, blockchain

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="HoneyChain API",
    description="End-to-end honey traceability — from hive to bottle",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(farmers.router, prefix="/api/farmers", tags=["Farmers"])
app.include_router(batches.router, prefix="/api/batches", tags=["Batches"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(processing.router, prefix="/api/processing", tags=["Processing"])
app.include_router(verify.router, prefix="/api/verify", tags=["Consumer Verification"])
app.include_router(iot.router, prefix="/api/iot", tags=["IoT Sensors"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Analysis"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "honeychain-api", "version": "1.0.0"}
