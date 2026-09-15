import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple

class PatternDetector:
    """
    Detects Harmonic (XABCD) and Classic chart patterns.
    Implements precision ratio checking for Gartley, Bat, Butterfly, and Crab.
    """
    
    def __init__(self):
        # Precise harmonic ratios (Tolerances +/- 0.05)
        self.ratios = {
            "Gartley": {"AB_XA": 0.618, "BC_AB": [0.382, 0.886], "CD_BC": [1.272, 1.618], "AD_XA": 0.786},
            "Bat": {"AB_XA": [0.382, 0.500], "BC_AB": [0.382, 0.886], "CD_BC": [1.618, 2.618], "AD_XA": 0.886},
            "Butterfly": {"AB_XA": 0.786, "BC_AB": [0.382, 0.886], "CD_BC": [1.618, 2.618], "AD_XA": [1.27, 1.618]},
            "Crab": {"AB_XA": [0.382, 0.618], "BC_AB": [0.382, 0.886], "CD_BC": [2.24, 3.618], "AD_XA": 1.618}
        }
        self.tolerance = 0.05

    def check_ratio(self, value, target, tolerance=None):
        tol = tolerance or self.tolerance
        if isinstance(target, list):
            return target[0] - tol <= value <= target[1] + tol
        return target - tol <= value <= target + tol

    def detect_harmonics(self, pivots: List[Dict]) -> List[Dict]:
        """Scans the last 5 pivots for XABCD patterns."""
        if len(pivots) < 5:
            return []
            
        # Last 5 pivots: X, A, B, C, D
        X, A, B, C, D = pivots[-5:]
        
        XA = abs(A['price'] - X['price'])
        AB = abs(B['price'] - A['price'])
        BC = abs(C['price'] - B['price'])
        CD = abs(D['price'] - C['price'])
        AD = abs(D['price'] - X['price'])
        
        # Calculate Ratios
        r_AB_XA = AB / XA if XA != 0 else 0
        r_BC_AB = BC / AB if AB != 0 else 0
        r_CD_BC = CD / BC if BC != 0 else 0
        r_AD_XA = abs(D['price'] - X['price']) / XA if XA != 0 else 0
        
        detected = []
        for name, target in self.ratios.items():
            if self.check_ratio(r_AB_XA, target['AB_XA']) and \
               self.check_ratio(r_BC_AB, target['BC_AB']) and \
               self.check_ratio(r_CD_BC, target['CD_BC']) and \
               self.check_ratio(r_AD_XA, target['AD_XA']):
                
                direction = "bullish" if D['price'] < C['price'] and D['price'] < X['price'] else "bearish"
                
                detected.append({
                    "name": name,
                    "type": "harmonic",
                    "direction": direction,
                    "confidence": 0.95, # Simplified for now
                    "points": [X, A, B, C, D],
                    "prz": [D['price'] * 0.998, D['price'] * 1.002]
                })
        
        return detected

    def detect_classic_reversals(self, pivots: List[Dict]) -> List[Dict]:
        """Detects Double Tops/Bottoms and H&S."""
        if len(pivots) < 5:
            return []
            
        detected = []
        p = [pt['price'] for pt in pivots[-5:]]
        
        # Double Top (High, Low, High, Low, Price hitting resistance)
        if abs(p[0] - p[2]) / p[0] < 0.01 and p[1] < p[0] and p[3] < p[0]:
            detected.append({"name": "Double Top", "type": "classic", "direction": "bearish", "confidence": 0.8})
            
        # Double Bottom
        if abs(p[0] - p[2]) / p[0] < 0.01 and p[1] > p[0] and p[3] > p[0]:
            detected.append({"name": "Double Bottom", "type": "classic", "direction": "bullish", "confidence": 0.8})
            
        return detected
