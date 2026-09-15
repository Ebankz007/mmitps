from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.database import Base
from datetime import datetime

class PTDSignal(Base):
    __tablename__ = "ptd_signals"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    timeframe = Column(String)
    signal_time = Column(DateTime) # The predicted time of the turn
    created_at = Column(DateTime, default=datetime.utcnow)
    
    logic_type = Column(String) # Fibonacci, Gann, Astro, Cycles
    direction = Column(String) # UP, DOWN, TRANSITION
    confidence = Column(Float)
    
    # Outcome tracking
    is_evaluated = Column(Boolean, default=False)
    is_hit = Column(Boolean, default=None) # True if turn happened within window
    price_at_signal = Column(Float, nullable=True) # Price at predicted time
    actual_turn_time = Column(DateTime, nullable=True)
    error_minutes = Column(Float, nullable=True)
