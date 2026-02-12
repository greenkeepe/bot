import ccxt.pro as ccxt
import asyncio
import logging
from typing import Callable, Dict

class ExchangeClient:
    def __init__(self, exchange_id: str = 'binance', symbol: str = 'BTC/USDT'):
        self.exchange_id = exchange_id
        self.symbol = symbol
        self.exchange = getattr(ccxt, exchange_id)({
            'enableRateLimit': True,
            'options': {'defaultType': 'spot'}
        })
        self.is_running = False

    async def watch_ohlcv(self, callback: Callable[[Dict], None]):
        """Stream real-time OHLCV data."""
        self.is_running = True
        logging.info(f"Starting real-time stream for {self.symbol} on {self.exchange_id}")
        
        while self.is_running:
            try:
                ohlcv = await self.exchange.watch_ohlcv(self.symbol, timeframe='1m')
                # ohlcv format: [timestamp, open, high, low, close, volume]
                if callback:
                    await callback(ohlcv)
            except Exception as e:
                logging.error(f"Error watching OHLCV: {e}")
                await asyncio.sleep(5)

    async def close(self):
        self.is_running = False
        await self.exchange.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    client = ExchangeClient()
    
    async def print_data(data):
        print(f"Update: {data[-1]}")

    try:
        asyncio.run(client.watch_ohlcv(print_data))
    except KeyboardInterrupt:
        pass
