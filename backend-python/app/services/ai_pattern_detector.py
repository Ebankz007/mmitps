import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Optional

class AIPatternDetector:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, data: pd.DataFrame) -> np.array:
        """Prepare features for AI model"""
        df = data.copy()
        
        # Calculate various technical indicators
        df['SMA_10'] = df['Close'].rolling(window=10).mean()
        df['SMA_30'] = df['Close'].rolling(window=30).mean()
        
        # RSI calculation
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        df['Volume_Change'] = df['Volume'].pct_change()
        df['Price_Change'] = df['Close'].pct_change()
        
        features = []
        # Create feature matrix starting after 30 days buffer
        for i in range(30, len(df)):
            feature_vector = [
                df['SMA_10'].iloc[i] / df['Close'].iloc[i] - 1,
                df['SMA_30'].iloc[i] / df['Close'].iloc[i] - 1,
                df['RSI'].iloc[i] / 100 if not np.isnan(df['RSI'].iloc[i]) else 0.5,
                df['Volume_Change'].iloc[i] if not np.isnan(df['Volume_Change'].iloc[i]) else 0,
                df['Price_Change'].iloc[i] if not np.isnan(df['Price_Change'].iloc[i]) else 0,
                df.index[i].month / 12,
                df.index[i].day / 31
            ]
            features.append(feature_vector)
            
        return np.array(features)
    
    def train_model(self, historical_data: pd.DataFrame):
        """Train AI model to detect patterns"""
        if len(historical_data) < 100:
            return None
            
        features = self.prepare_features(historical_data)
        
        # Create labels (1 if price increased next 5 days, 0 otherwise)
        future_returns = historical_data['Close'].pct_change(5).shift(-5)
        # Shift -5 means we look 5 steps ahead. 
        # We need to align labels with features (which started at index 30)
        labels = (future_returns > 0).astype(int).iloc[30:len(features)+30]
        
        # Filter out NaN in features or labels
        valid_mask = ~np.isnan(features).any(axis=1) & ~labels.isna()
        X = features[valid_mask]
        y = labels[valid_mask]
        
        if len(X) > 50:
            X_scaled = self.scaler.fit_transform(X)
            self.model.fit(X_scaled, y)
            self.is_trained = True
            return {"status": "trained", "samples": len(X)}
        
        return None
    
    def predict_future_patterns(self, current_data: pd.DataFrame) -> List[Dict]:
        """Predict confidence for current market state"""
        if not self.is_trained or len(current_data) < 30:
            return []
            
        features = self.prepare_features(current_data)
        if len(features) == 0:
            return []
            
        X_scaled = self.scaler.transform(features)
        probabilities = self.model.predict_proba(X_scaled)
        
        predictions = []
        # We only care about high confidence predictions for the last sequence
        for i, prob in enumerate(probabilities):
            if prob[1] > 0.7 or prob[0] > 0.7:
                date = current_data.index[i + 30]
                direction = "BUY" if prob[1] > 0.7 else "SELL"
                confidence = max(prob)
                
                predictions.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "confidence": float(confidence * 100),
                    "direction": direction,
                    "type": "AI_Predicted"
                })
                
        return predictions[-10:] # Return latest predictions
