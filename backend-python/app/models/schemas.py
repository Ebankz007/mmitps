from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SeasonalRequest(BaseModel):
    market: str
    timeframe: str
    patterns: List[str]
    custom_years: Optional[List[int]] = None

class MonthlyDataPoint(BaseModel):
    month: str
    average: float
    min: float
    max: float
    consistency: float

class SeasonalPattern(BaseModel):
    start_month: str
    end_month: str
    type: str  # "buy" or "sell"
    consistency: float
    avg_return: float
    years_positive: int
    total_years: int
    ai_predicted: Optional[bool] = False

class SeasonalResponse(BaseModel):
    market: str
    timeframe: str
    monthly_data: List[MonthlyDataPoint]
    yearly_data: List[Dict[str, Any]]
    patterns: List[SeasonalPattern]
    optimum_patterns: List[Dict]

class AIPrediction(BaseModel):
    date: str
    confidence: float
    direction: str
    type: str

class MarketHealth(BaseModel):
    market: str
    health_score: float
    metrics: Dict[str, float]
    rating: str
