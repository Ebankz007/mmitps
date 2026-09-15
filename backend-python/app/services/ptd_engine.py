import numpy as np
import pandas as pd
from scipy.signal import find_peaks
import swisseph as swe
from datetime import datetime, timedelta
import statsmodels.api as sm

class PTDEngine:
    @staticmethod
    def calculate_fibonacci_time_projections(df: pd.DataFrame, ratios=[0.382, 0.618, 1.272, 1.618, 2.618]):
        """Projects future turning points based on historical pivot intervals."""
        if len(df) < 50: return []
        
        # Detect significant swings using price extremes
        prices = df['Close'].values
        peaks, _ = find_peaks(prices, distance=10)
        troughs, _ = find_peaks(-prices, distance=10)
        
        pivots = sorted(list(peaks) + list(troughs))
        if len(pivots) < 3: return []
        
        last_pivot_idx = pivots[-1]
        last_pivot_time = df.index[last_pivot_idx]
        
        projections = []
        # Measure intervals between previous pivots
        for i in range(len(pivots) - 1):
            interval = pivots[i+1] - pivots[i]
            for ratio in ratios:
                projected_index = last_pivot_idx + int(interval * ratio)
                if projected_index > len(df):
                    # Estimate future time
                    time_diff = (df.index[1] - df.index[0]) * (projected_index - last_pivot_idx)
                    projected_time = last_pivot_time + time_diff
                    projections.append({
                        "time": projected_time,
                        "ratio": ratio,
                        "type": "Fibonacci Time",
                        "confidence": 0.75
                    })
        
        return projections

    @staticmethod
    def calculate_algorithmic_cycles(df: pd.DataFrame, top_n=3):
        """Identifies dominant cycles using Fast Fourier Transform."""
        if len(df) < 100: return []
        
        close_prices = df['Close'].values
        # Detrend the data
        detrended = close_prices - np.linspace(close_prices[0], close_prices[-1], len(close_prices))
        
        # FFT Analysis
        fft = np.fft.fft(detrended)
        frequencies = np.fft.fftfreq(len(detrended))
        amplitudes = np.abs(fft)
        
        # Get dominant frequencies (skip index 0 - DC component)
        indices = np.argsort(amplitudes)[1:top_n+1]
        
        projections = []
        last_time = df.index[-1]
        time_step = df.index[1] - df.index[0]
        
        for idx in indices:
            freq = frequencies[idx]
            if freq == 0: continue
            period = 1 / abs(freq)
            
            # Project peak/trough of this cycle
            # Phase calculation
            phase = np.angle(fft[idx])
            
            # Example: Next turning point estimation
            # Simplification: next cycle completion
            next_turn_idx = len(df) + int(period / 2) 
            projected_time = last_time + (time_step * int(period / 2))
            
            projections.append({
                "time": projected_time,
                "period": round(period, 2),
                "type": "Cycle Prediction",
                "confidence": 0.85
            })
            
        return projections

    @staticmethod
    def get_astro_aspects(start_date: datetime, end_date: datetime):
        """Identifies major planetary aspects (conjunction, opposition, square)."""
        swe.set_ephe_path('/usr/share/ephe') # Path needs to be correct for the OS
        
        planets = [swe.SUN, swe.MOON, swe.MERCURY, swe.VENUS, swe.MARS, swe.JUPITER, swe.SATURN]
        aspects = []
        
        # Check every 6 hours for simplicity
        curr = start_date
        while curr < end_date:
            jd = swe.julday(curr.year, curr.month, curr.day, curr.hour)
            positions = {}
            for p in planets:
                res, _ = swe.calc_ut(jd, p)
                positions[p] = res[0] # Longitude
                
            # Check aspect between pairs
            for i in range(len(planets)):
                for j in range(i + 1, len(planets)):
                    diff = abs(positions[planets[i]] - positions[planets[j]])
                    if diff > 180: diff = 360 - diff
                    
                    # Major aspects (0, 90, 180) with 2 deg orb
                    if diff < 2:
                        aspects.append({"time": curr, "type": "Astro Aspect", "desc": "Conjunction", "confidence": 0.7})
                    elif abs(diff - 90) < 2:
                        aspects.append({"time": curr, "type": "Astro Aspect", "desc": "Square", "confidence": 0.65})
                    elif abs(diff - 180) < 2:
                        aspects.append({"time": curr, "type": "Astro Aspect", "desc": "Opposition", "confidence": 0.8})
            
            curr += timedelta(hours=6)
            
        return aspects

    @staticmethod
    def calculate_gann_square_out(price: float, current_time: datetime):
        """Simple Gann Square of 9 'Square Out' estimation."""
        # Convert price to degrees on the square
        root = np.sqrt(price)
        degrees = (root % 1) * 360
        
        # Projections at 45, 90, 180 deg shifts
        projections = []
        for angle in [90, 180, 270, 360]:
            # Time projection usually maps price degrees to days/hours
            # Standard Gann mapping: 1 deg = 1 day (or 1 bar)
            days_ahead = angle / 10 # Scaled for demonstration
            projections.append({
                "time": current_time + timedelta(days=days_ahead),
                "type": "Gann Square Out",
                "angle": angle,
                "confidence": 0.7
            })
        return projections
