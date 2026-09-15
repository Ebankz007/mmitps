import pandas as pd
import numpy as np

class GeometryEngine:
    @staticmethod
    def detect_structure(df: pd.DataFrame, window: int = 5) -> dict:
        """Detect Highs/Lows and Structural Shifts (BOS/CHoCH)"""
        if len(df) < window * 2:
            return {"structure": "neutral", "points": []}
        
        # Simple pivot detection
        highs = df['high'].rolling(window=window*2+1, center=True).max()
        lows = df['low'].rolling(window=window*2+1, center=True).min()
        
        # Filter for actual pivots
        pivot_highs = df[df['high'] == highs]
        pivot_lows = df[df['low'] == lows]
        
        # TODO: Implement BOS/CHoCH logic based on pivot sequences
        return {
            "pivots": {
                "highs": pivot_highs[['high']].to_dict(),
                "lows": pivot_lows[['low']].to_dict()
            },
            "last_structure": "HL" # Higher Low example
        }

    @staticmethod
    def calculate_pitchfork(p1: dict, p2: dict, p3: dict) -> dict:
        """Calculate Andrews Pitchfork coordinates"""
        # p1=origin, p2=high/low, p3=low/high
        median_x = (p2['x'] + p3['x']) / 2
        median_y = (p2['y'] + p3['y']) / 2
        
        slope = (median_y - p1['y']) / (median_x - p1['x'])
        
        return {
            "median_line": {"slope": slope, "intercept": p1['y'] - slope * p1['x']},
            "upper_parallel": {"slope": slope, "intercept": p2['y'] - slope * p2['x']},
            "lower_parallel": {"slope": slope, "intercept": p3['y'] - slope * p3['x']}
        }
