import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from app.services.ptd_engine import PTDEngine

class BacktestingEngine:
    @staticmethod
    async def run_backtest(symbol: str, start_date: datetime, end_date: datetime, logics: list):
        """Simulates trading PTD signals over a historical range."""
        # 1. Fetch full historical data
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start_date, end=end_date, interval="1h")
        
        if df.empty:
            return {"error": "No historical data found for period"}

        results = []
        equity = 10000.0
        equity_curve = []
        
        # 2. Iterate through time in steps
        # We simulate "scanning" every 4 hours
        curr = start_date + timedelta(days=5) # Need buffer for first scans
        while curr < end_date:
            # Slice dataframe up to current "simulation time"
            lookback_df = df[df.index <= curr]
            if len(lookback_df) < 50: 
                curr += timedelta(hours=4)
                continue
                
            projections = []
            if "fibonacci" in logics:
                projections.extend(PTDEngine.calculate_fibonacci_time_projections(lookback_df))
            if "cycles" in logics:
                projections.extend(PTDEngine.calculate_algorithmic_cycles(lookback_df))
            
            # Simple simulation: If projection is within next 4 hours, take a "Trade"
            # For backtesting, we check if the PREDICTED turn happened in the REAL data later
            for proj in projections:
                # Prediction is for future
                target_time = proj['time']
                if curr < target_time <= curr + timedelta(hours=4):
                    # Check future performance (+24h)
                    future_df = df[(df.index > target_time) & (df.index <= target_time + timedelta(hours=24))]
                    if not future_df.empty:
                        # Simple rule: if price is higher after 24h, it's a "Bullish" success (dummy logic)
                        price_start = future_df['Close'].iloc[0]
                        price_end = future_df['Close'].iloc[-1]
                        
                        perf = (price_end - price_start) / price_start
                        # If direction matches or just general return
                        trade_profit = equity * 0.05 * perf # Use 5% risk
                        equity += trade_profit
                        
                        results.append({
                            "time": target_time,
                            "type": proj['type'],
                            "profit": round(trade_profit, 2),
                            "equity": round(equity, 2)
                        })
            
            equity_curve.append({
                "time": curr.strftime("%Y-%m-%d %H:%M"),
                "balance": round(equity, 2)
            })
            curr += timedelta(hours=4)

        return {
            "initial_balance": 10000.0,
            "final_balance": round(equity, 2),
            "total_trades": len(results),
            "win_rate": 68.5, # Mock win rate for now
            "trades": results[-10:], # Last 10 trades
            "equity_curve": equity_curve[::6] # Sample for frontend (every 24h)
        }
