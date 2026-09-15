import numpy as np
import pandas as pd

class VolumeEngine:
    @staticmethod
    def calculate_roc(volume_series: pd.Series, periods: int = 20) -> float:
        """Calculate Volume Rate of Change"""
        if len(volume_series) < periods + 1:
            return 0.0
        
        current_vol = volume_series.iloc[-1]
        prev_vol = volume_series.iloc[-periods - 1]
        
        if prev_vol == 0:
            return 0.0
            
        return ((current_vol - prev_vol) / prev_vol) * 100

    @staticmethod
    def calculate_z_score(volume_series: pd.Series, window: int = 20) -> float:
        """Calculate Volume Z-Score based on a rolling window"""
        if len(volume_series) < window:
            return 0.0
        
        rolling_mean = volume_series.rolling(window=window).mean()
        rolling_std = volume_series.rolling(window=window).std()
        
        current_vol = volume_series.iloc[-1]
        mean = rolling_mean.iloc[-1]
        std = rolling_std.iloc[-1]
        
        if std == 0:
            return 0.0
            
        return (current_vol - mean) / std

    @staticmethod
    def calculate_obv(price_series: pd.Series, volume_series: pd.Series) -> pd.Series:
        """Calculate On-Balance Volume (OBV)"""
        obv = [0]
        for i in range(1, len(price_series)):
            if price_series.iloc[i] > price_series.iloc[i-1]:
                obv.append(obv[-1] + volume_series.iloc[i])
            elif price_series.iloc[i] < price_series.iloc[i-1]:
                obv.append(obv[-1] - volume_series.iloc[i])
            else:
                obv.append(obv[-1])
        return pd.Series(obv, index=price_series.index)

    @staticmethod
    def calculate_v_vol_ratio(volume_roc: float, atr_percent: float) -> float:
        """Calculate Volume-to-Volatility Ratio"""
        if atr_percent == 0:
            return 0.0
        return volume_roc / atr_percent
