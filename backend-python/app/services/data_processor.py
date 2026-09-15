import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import yfinance as yf

class SeasonalDataProcessor:
    def __init__(self):
        self.market_mapping = {
            # --- FOREX ---
            "Euro": "EURUSD=X",
            "British Pound": "GBPUSD=X",
            "Japanese Yen": "USDJPY=X",
            "Swiss Franc": "USDCHF=X",
            "Australian Dollar": "AUDUSD=X",
            "Canadian Dollar": "USDCAD=X",
            "NZ Dollar": "NZDUSD=X",
            "EUR/GBP": "EURGBP=X",
            "EUR/JPY": "EURJPY=X",
            "GBP/JPY": "GBPJPY=X",
            
            # --- CRYPTO ---
            "Bitcoin": "BTC-USD",
            "Ethereum": "ETH-USD",
            "Solana": "SOL-USD",
            "Cardano": "ADA-USD",
            "Ripple": "XRP-USD",
            "Polkadot": "DOT-USD",
            "Chainlink": "LINK-USD",
            "Litecoin": "LTC-USD",
            "Avalanche": "AVAX-USD",
            "Dogecoin": "DOGE-USD",
            
            # --- INDICES ---
            "S&P 500": "^GSPC",
            "NASDAQ 100": "^NDX",
            "Dow Jones": "^DJI",
            "FTSE 100": "^FTSE",
            "DAX 40": "^GDAXI",
            "CAC 40": "^FCHI",
            "Nikkei 225": "^N225",
            "Hang Seng": "^HSI",
            "Russell 2000": "^RUT",
            "VIX Index": "^VIX",
            
            # --- COMMODITIES ---
            "Gold": "GC=F",
            "Silver": "SI=F",
            "Crude Oil": "CL=F",
            "Brent Oil": "BZ=F",
            "Natural Gas": "NG=F",
            "Copper": "HG=F",
            "Platinum": "PL=F",
            "Corn": "ZC=F",
            "Wheat": "ZW=F",
            "Coffee": "KC=F",
            
            # --- EQUITIES ---
            "Apple": "AAPL",
            "Microsoft": "MSFT",
            "Google": "GOOGL",
            "Amazon": "AMZN",
            "Tesla": "TSLA",
            "NVIDIA": "NVDA",
            "Meta": "META",
            "Netflix": "NFLX",
            "AstraZeneca": "AZN.L",
            "TSMC": "TSM",
            "Berkshire": "BRK-B",
            "Visa": "V",
            "JPMorgan": "JPM"
        }
    
    def fetch_historical_data(self, market: str, years: int = 20) -> pd.DataFrame:
        """Fetch historical price data for a market"""
        ticker = self.market_mapping.get(market, market)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years*365)
        
        stock = yf.Ticker(ticker)
        data = stock.history(start=start_date, end=end_date)
        
        if data.empty:
            return pd.DataFrame()
            
        # Calculate daily returns
        data['Return'] = data['Close'].pct_change()
        return data
    
    def calculate_seasonal_pattern(self, data: pd.DataFrame, years: int = 20) -> Dict:
        """Calculate seasonal patterns from historical data"""
        if data.empty:
            return {}
            
        # Extract month and day
        data['Month'] = data.index.month
        data['Year'] = data.index.year
        data['Month_Day'] = data.index.strftime('%m-%d')
        
        # Calculate average for each day of the year
        daily_avg = data.groupby('Month_Day')['Return'].agg(['mean', 'std', 'count'])
        
        # Calculate consistency (% of years positive for that day)
        def calc_consistency(x):
            if len(x) == 0: return 0
            return (x > 0).sum() / len(x) * 100
            
        daily_avg['consistency'] = data.groupby('Month_Day')['Return'].apply(calc_consistency)
        
        # Convert to monthly aggregates for smoother display
        monthly_data = []
        for month in range(1, 13):
            month_data = data[data['Month'] == month]
            if not month_data.empty:
                avg_return = month_data['Return'].mean() * 100
                consistency = calc_consistency(month_data['Return'])
                
                monthly_data.append({
                    "month": datetime(2000, month, 1).strftime('%B'),
                    "average": round(avg_return * 100, 2), # Scale for visibility as requested
                    "min": round(month_data['Return'].min() * 100, 2),
                    "max": round(month_data['Return'].max() * 100, 2),
                    "consistency": round(consistency, 1)
                })
        
        return {
            "monthly_data": monthly_data,
            "daily_stats": daily_avg.to_dict('index')
        }
    
    def detect_optimum_patterns(self, data: pd.DataFrame, min_consistency: float = 70.0) -> List[Dict]:
        """Detect periods with high directional consistency"""
        if data.empty:
            return []
            
        patterns = []
        
        # Calculate rolling returns and consistency (20 trading days ~ 1 month)
        data = data.sort_index()
        data['Rolling_Return'] = data['Return'].rolling(window=20).mean()
        
        def rolling_consistency(x):
            if len(x) < 20: return np.nan
            return (x > 0).sum() / len(x) * 100
            
        data['Rolling_Consistency'] = data['Return'].rolling(window=20).apply(rolling_consistency)
        
        # Find periods with high consistency
        high_consistency_periods = data[data['Rolling_Consistency'] >= min_consistency].copy()
        
        if not high_consistency_periods.empty:
            # Group consecutive periods
            high_consistency_periods['Group'] = (
                high_consistency_periods.index.to_series().diff() > pd.Timedelta(days=1)
            ).cumsum()
            
            for group in high_consistency_periods['Group'].unique():
                group_data = high_consistency_periods[high_consistency_periods['Group'] == group]
                if len(group_data) >= 5: # Minimum 5 trading days
                    avg_return = group_data['Rolling_Return'].mean() * 100
                    pattern_type = "buy" if avg_return > 0 else "sell"
                    
                    patterns.append({
                        "start_date": group_data.index[0].strftime('%Y-%m-%d'),
                        "end_date": group_data.index[-1].strftime('%Y-%m-%d'),
                        "start_month": group_data.index[0].strftime('%B'),
                        "end_month": group_data.index[-1].strftime('%B'),
                        "type": pattern_type,
                        "consistency": round(group_data['Rolling_Consistency'].mean(), 1),
                        "avg_return": round(abs(avg_return), 2),
                        "years_positive": int(group_data['Rolling_Consistency'].mean() / 100 * len(group_data)),
                        "total_years": len(group_data)
                    })
        
        return patterns
