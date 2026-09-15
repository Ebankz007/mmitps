from fastapi import APIRouter, HTTPException
from app.models.schemas import SeasonalRequest, SeasonalResponse, MarketHealth
from app.services.data_processor import SeasonalDataProcessor
from app.services.ai_pattern_detector import AIPatternDetector
from datetime import datetime
import numpy as np

router = APIRouter()
data_processor = SeasonalDataProcessor()
ai_detector = AIPatternDetector()

@router.post("/seasonal-data", response_model=SeasonalResponse)
async def get_seasonal_data(request: SeasonalRequest):
    """Get seasonal data for a specific market with AI insights"""
    try:
        years = int(request.timeframe.split()[0]) if "Years" in request.timeframe else 20
        
        # Fetch data
        df = data_processor.fetch_historical_data(request.market, years)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {request.market}")
            
        # AI Training (for demonstration, we train on the fly or load)
        ai_detector.train_model(df)
        
        # Calculate patterns
        seasonal_patterns = data_processor.calculate_seasonal_pattern(df, years)
        optimum_patterns = data_processor.detect_optimum_patterns(df)
        ai_predictions = ai_detector.predict_future_patterns(df)
        
        # Prepare yearly data for overlay (last 5 years)
        yearly_data = []
        for year in df['Year'].unique()[-5:]:
            year_data = df[df['Year'] == year]
            yearly_values = []
            for m in range(1, 13):
                m_val = year_data[year_data['Month'] == m]['Return'].mean() * 100
                yearly_values.append(m_val if not np.isnan(m_val) else 0)
                
            yearly_data.append({
                "key": str(year),
                "values": yearly_values
            })
            
        # Combine patterns
        all_patterns = []
        for p in optimum_patterns:
            all_patterns.append({
                "start_month": p['start_month'],
                "end_month": p['end_month'],
                "type": p['type'],
                "consistency": p['consistency'],
                "avg_return": p['avg_return'],
                "years_positive": p['years_positive'],
                "total_years": p['total_years'],
                "ai_predicted": False
            })
            
        return SeasonalResponse(
            market=request.market,
            timeframe=request.timeframe,
            monthly_data=seasonal_patterns['monthly_data'],
            yearly_data=yearly_data,
            patterns=all_patterns,
            optimum_patterns=optimum_patterns + ai_predictions
        )
        
    except Exception as e:
        print(f"Error processing seasonal data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/markets")
async def get_markets():
    """Get available institutional markets"""
    return {
        "markets": list(data_processor.market_mapping.keys()),
        "timeframes": ["5 Years", "10 Years", "20 Years", "30 Years", "All Years"],
        "patterns": ["20 Years", "10 Years", "5 Years", "All Years", "Weighted Average", "Current Year"]
    }

@router.get("/market-health/{market}", response_model=MarketHealth)
async def get_market_health(market: str):
    """Calculate institutional health score for a market"""
    try:
        df = data_processor.fetch_historical_data(market, 20)
        if df.empty:
            raise HTTPException(status_code=404, detail="Market not found")
            
        patterns = data_processor.detect_optimum_patterns(df)
        
        # Scoring logic
        strong_patterns = sum(1 for p in patterns if p['consistency'] >= 80)
        avg_consistency = np.mean([p['consistency'] for p in patterns]) if patterns else 0
        recent_trend = df['Return'].tail(30).mean() * 100
        
        health_score = (strong_patterns * 20) + (avg_consistency * 0.5) + (recent_trend * 10)
        health_score = min(max(health_score, 0), 100)
        
        rating = "Excellent" if health_score >= 80 else "Good" if health_score >= 60 else "Fair" if health_score >= 40 else "Poor"
        
        return MarketHealth(
            market=market,
            health_score=round(health_score, 1),
            metrics={
                "total_patterns": len(patterns),
                "strong_patterns": strong_patterns,
                "avg_consistency": round(avg_consistency, 1),
                "recent_trend": round(recent_trend, 2)
            },
            rating=rating
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
