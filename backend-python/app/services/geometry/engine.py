import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple

class GeometryEngine:
    """
    Precision Geometric Math Engine for MMITPS 'Total Market Geometry'.
    Handles static price levels, dynamic trend geometry, and structural symmetry.
    """
    
    def __init__(self):
        self.phi = 1.61803398875  # Golden Ratio
        self.inv_phi = 0.61803398875
        
    def calculate_fibonacci_levels(self, high: float, low: float) -> Dict[str, Dict[str, float]]:
        """Calculate retracement and extension levels."""
        diff = high - low
        
        retracements = {
            "0.236": high - diff * 0.236,
            "0.382": high - diff * 0.382,
            "0.500": high - diff * 0.500,
            "0.618": high - diff * 0.618,
            "0.707": high - diff * 0.707,  # OTE (Optimal Trade Entry)
            "0.786": high - diff * 0.786,
            "0.886": high - diff * 0.886
        }
        
        extensions = {
            "1.272": high + diff * 0.272,
            "1.414": high + diff * 0.414,
            "1.618": high + diff * 0.618,
            "2.000": high + diff * 1.0,
            "2.618": high + diff * 1.618
        }
        
        return {"retracements": retracements, "extensions": extensions}

    def calculate_gann_angles(self, start_price: float, start_idx: int, current_idx: int, scale: float) -> Dict[str, List[float]]:
        """Calculate Gann 1x1, 1x2, 2x1 lines from a significant pivot."""
        x = np.arange(start_idx, current_idx + 1)
        relative_x = x - start_idx
        
        # Gann Slope = Scale * (Units of Price / Units of Time)
        angles = {
            "1x1": start_price + (relative_x * scale),
            "1x2": start_price + (relative_x * scale * 0.5),
            "2x1": start_price + (relative_x * scale * 2.0),
            "1x4": start_price + (relative_x * scale * 0.25),
            "4x1": start_price + (relative_x * scale * 4.0)
        }
        return {k: v.tolist() for k, v in angles.items()}

    def detect_market_structure(self, df: pd.DataFrame, window: int = 5) -> List[Dict]:
        """Detect Higher Highs, Lower Lows, and BOS (Break of Structure)."""
        structure = []
        
        for i in range(window, len(df) - window):
            curr_high = df['High'].iloc[i]
            curr_low = df['Low'].iloc[i]
            
            # Fractal High (HH or LH)
            if all(curr_high > df['High'].iloc[i-j] for j in range(1, window+1)) and \
               all(curr_high > df['High'].iloc[i+j] for j in range(1, window+1)):
                structure.append({"type": "peak", "idx": i, "price": curr_high})
                
            # Fractal Low (HL or LL)
            elif all(curr_low < df['Low'].iloc[i-j] for j in range(1, window+1)) and \
                 all(curr_low < df['Low'].iloc[i+j] for j in range(1, window+1)):
                structure.append({"type": "trough", "idx": i, "price": curr_low})
                
        return structure

    def calculate_pitchfork(self, p1: Tuple[int, float], p2: Tuple[int, float], p3: Tuple[int, float], length: int) -> Dict[str, List[float]]:
        """Calculate Andrews Pitchfork median and parallel lines."""
        # Median line is from P1 through the midpoint of P2-P3
        mid_x = (p2[0] + p3[0]) / 2
        mid_y = (p2[1] + p3[1]) / 2
        
        slope = (mid_y - p1[1]) / (mid_x - p1[0])
        
        x_vals = np.arange(p1[0], p1[0] + length)
        median_line = p1[1] + slope * (x_vals - p1[0])
        
        # Parallel lines (Schiff shift often used, but here we do standard)
        height = abs(p2[1] - p3[1]) / 2
        upper_line = median_line + height
        lower_line = median_line - height
        
        return {
            "median": median_line.tolist(),
            "upper": upper_line.tolist(),
            "lower": lower_line.tolist()
        }
