import json
import asyncio
import websockets
import pandas as pd
from typing import Callable, List

class BinanceConnector:
    """
    Real-time WebSocket connector for Binance.
    Streams candlestick (kline) data to the Geometry Engine.
    """
    
    def __init__(self, symbols: List[str] = ["btcusdt", "ethusdt"]):
        self.base_url = "wss://stream.binance.com:9443/ws"
        self.symbols = [s.lower() for s in symbols]
        self.connected = False
        self.on_message_callback = None

    async def connect(self, callback: Callable):
        """Connect to Binance WS and start streaming."""
        self.on_message_callback = callback
        streams = "/".join([f"{s}@kline_1m" for s in self.symbols])
        url = f"{self.base_url}/{streams}"
        
        async with websockets.connect(url) as websocket:
            self.connected = True
            print(f"Connected to Binance WS: {url}")
            
            while self.connected:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    # Extract kline data
                    kline = data['k']
                    processed_data = {
                        "symbol": data['s'],
                        "time": kline['t'],
                        "open": float(kline['o']),
                        "high": float(kline['h']),
                        "low": float(kline['l']),
                        "close": float(kline['c']),
                        "volume": float(kline['v']),
                        "is_closed": kline['x']
                    }
                    
                    if self.on_message_callback:
                        await self.on_message_callback(processed_data)
                        
                except Exception as e:
                    print(f"WS Error: {e}")
                    await asyncio.sleep(5)
                    break

    def stop(self):
        self.connected = False
