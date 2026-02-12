import pandas as pd
import pandas_ta as ta
import logging
from typing import List, Dict

class NexusStrategy:
    def __init__(self, rsi_period=14, ema_fast=9, ema_slow=21):
        self.rsi_period = rsi_period
        self.ema_fast = ema_fast
        self.ema_slow = ema_slow
        self.data = pd.DataFrame(columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        self.position = None # 'LONG', 'SHORT', None
        
    def add_data(self, ohlcv_list: List[List]):
        """Update the internal dataframe with new OHLCV data."""
        new_data = pd.DataFrame(ohlcv_list, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        self.data = pd.concat([self.data, new_data]).drop_duplicates(subset=['timestamp']).tail(100)
        self.data['timestamp'] = pd.to_datetime(self.data['timestamp'], unit='ms')
        self.data.set_index('timestamp', inplace=False)

    def analyze(self) -> Dict:
        """Calculate indicators and generate signals."""
        if len(self.data) < self.ema_slow:
            return {"signal": "WAIT", "message": "Inizializzazione dati..."}

        df = self.data.copy()
        
        # Calculate Indicators
        df['RSI'] = ta.rsi(df['close'], length=self.rsi_period)
        df['EMA_FAST'] = ta.ema(df['close'], length=self.ema_fast)
        df['EMA_SLOW'] = ta.ema(df['close'], length=self.ema_slow)
        
        last_row = df.iloc[-1]
        prev_row = df.iloc[-2]

        signal = "NEUTRAL"
        
        # Strategy Logic: EMA Crossover + RSI Confirmation
        cross_up = prev_row['EMA_FAST'] < prev_row['EMA_SLOW'] and last_row['EMA_FAST'] > last_row['EMA_SLOW']
        cross_down = prev_row['EMA_FAST'] > prev_row['EMA_SLOW'] and last_row['EMA_FAST'] < last_row['EMA_SLOW']
        
        if cross_up and last_row['RSI'] > 50:
            signal = "BUY"
        elif cross_down and last_row['RSI'] < 50:
            signal = "SELL"

        return {
            "signal": signal,
            "rsi": round(last_row['RSI'], 2),
            "ema_fast": round(last_row['EMA_FAST'], 2),
            "ema_slow": round(last_row['EMA_SLOW'], 2),
            "price": last_row['close']
        }

    def check_risk_management(self, current_price, entry_price, stop_loss_pct=0.02, take_profit_pct=0.04):
        """Simple risk management logic."""
        if self.position == 'LONG':
            if current_price <= entry_price * (1 - stop_loss_pct):
                return "EXIT_LOSS"
            if current_price >= entry_price * (1 + take_profit_pct):
                return "EXIT_PROFIT"
        return "HOLD"
