import pandas as pd

class OIEngine:
    @staticmethod
    def detect_divergence(price_change: float, oi_change: float) -> dict:
        """Detect divergence between price and Open Interest"""
        if price_change > 0 and oi_change > 0:
            return {
                "signal": "bullish_confirmation",
                "description": "New money entering, trend strengthening"
            }
        elif price_change < 0 and oi_change > 0:
            return {
                "signal": "bearish_confirmation",
                "description": "New shorts entering, potential breakdown"
            }
        elif price_change > 0 and oi_change < 0:
            return {
                "signal": "reversal_warning",
                "description": "Short covering, potential trend exhaustion"
            }
        elif price_change < 0 and oi_change < 0:
            return {
                "signal": "liquidation",
                "description": "Long liquidation, trend weakening"
            }
        return {
            "signal": "neutral",
            "description": "No significant OI/Price divergence detected"
        }
