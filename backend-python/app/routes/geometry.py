from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.geometry.engine import GeometryEngine
from app.services.geometry.pattern_detector import PatternDetector
import yfinance as yf
import pandas as pd
import asyncio

router = APIRouter()
engine = GeometryEngine()
detector = PatternDetector()

class GeometryScanRequest(BaseModel):
    symbol: str
    timeframe: str # 15m, 1h, 4h, 1d
    period: str = "5d"

class GeometryResponse(BaseModel):
    symbol: str
    timeframe: str
    patterns: List[dict]
    levels: Dict[str, Dict[str, float]]
    confluence_score: float

@router.post("/scan", response_model=GeometryResponse)
async def scan_geometry(request: GeometryScanRequest):
    """
    Scans a specific instrument for 'Total Market Geometry' patterns.
    Supports Crypto, Forex, Commodities, and Indices.
    """
    try:
        # 1. Fetch historical data for initial scan
        # We use yfinance for initial data (Forex/Indices) and Binance for live
        df = yf.download(request.symbol, period=request.period, interval=request.timeframe)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data for {request.symbol}")

        # 2. Extract pivots and market structure
        structure = engine.detect_market_structure(df)
        
        # 3. Detect Patterns (Harmonics/Classic)
        pivots = [{"price": s['price'], "index": s['idx']} for s in structure]
        harmonics = detector.detect_harmonics(pivots)
        classic = detector.detect_classic_reversals(pivots)
        
        # 4. Calculate Static Geometry (Fibonacci)
        high = float(df['High'].max())
        low = float(df['Low'].min())
        fibs = engine.calculate_fibonacci_levels(high, low)
        
        # 5. Composite Confluence Score
        score = calculate_composite_score(harmonics, classic, fibs, df['Close'].iloc[-1])
        
        return {
            "symbol": request.symbol,
            "timeframe": request.timeframe,
            "patterns": harmonics + classic,
            "levels": fibs,
            "confluence_score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_composite_score(harmonics, classic, fibs, current_price):
    """Weighted confluence scoring."""
    score = 0
    if harmonics: score += 40
    if classic: score += 25
    
    # Check if near fib retracements
    for lvl in fibs['retracements'].values():
        if abs(current_price - lvl) / current_price < 0.005: # Within 0.5%
            score += 15
            break
            
    return min(100, score)

@router.get("/confluence/{symbol}")
async def get_confluence_score(symbol: str):
    # This would ideally be a real-time summary from the WS stream
    return {
        "symbol": symbol,
        "score": 85,
        "status": "entry_zone_active"
    }

