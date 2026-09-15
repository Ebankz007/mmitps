from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import seasonality, geometry, volume, ptd
from app.database import engine, Base
import asyncio

app = FastAPI(
    title="MMITPS Multi-Asset Intelligence Engine",
    description="Institutional-grade analysis engine for Seasonality, Geometry, and Volume",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seasonality.router, prefix="/api/seasonality", tags=["seasonality"])
app.include_router(geometry.router, prefix="/api/geometry", tags=["geometry"])
app.include_router(volume.router, prefix="/api/volume", tags=["volume"])
app.include_router(ptd.router, prefix="/api/ptd", tags=["ptd"])

@app.on_event("startup")
async def startup():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {
        "message": "Seasonal Intelligence Pro Max Engine is active",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
