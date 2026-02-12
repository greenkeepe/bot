import asyncio
import logging
import json
from exchange_client import ExchangeClient
from strategy import NexusStrategy
import websockets

class BotManager:
    def __init__(self):
        self.exchange = ExchangeClient()
        self.strategy = NexusStrategy()
        self.clients = set()
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    async def broadcast(self, message):
        """Send message to all connected dashboard clients."""
        if not self.clients:
            return
        msg_str = json.dumps(message)
        await asyncio.gather(*[client.send(msg_str) for client in self.clients])

    async def handle_market_data(self, ohlcv_list):
        """Process incoming market data."""
        self.strategy.add_data(ohlcv_list)
        analysis = self.strategy.analyze()
        
        # Prepare payload for UI
        payload = {
            "type": "UPDATE",
            "symbol": self.exchange.symbol,
            "data": analysis
        }
        
        if analysis['signal'] in ['BUY', 'SELL']:
            logging.info(f"SIGNAL DETECTED: {analysis['signal']} at {analysis['price']}")
            payload['type'] = "SIGNAL"
            
        await self.broadcast(payload)

    async def ws_handler(self, websocket, path):
        """Handle WebSocket connections from the dashboard."""
        self.clients.add(websocket)
        logging.info(f"New client connected. Total: {len(self.clients)}")
        try:
            async for message in websocket:
                # Handle potential commands from UI (e.g., START/STOP/REFRESH)
                pass
        finally:
            self.clients.remove(websocket)
            logging.info(f"Client disconnected. Total: {len(self.clients)}")

    async def run(self):
        """Main execution loop."""
        # Start WebSocket Server for UI
        server = await websockets.serve(self.ws_handler, "localhost", 8765)
        logging.info("WebSocket Server started on ws://localhost:8765")
        
        # Start Exchange Streaming
        try:
            await self.exchange.watch_ohlcv(self.handle_market_data)
        except Exception as e:
            logging.error(f"Bot execution error: {e}")
        finally:
            await self.exchange.close()
            server.close()
            await server.wait_closed()

if __name__ == "__main__":
    bot = BotManager()
    try:
        asyncio.run(bot.run())
    except KeyboardInterrupt:
        logging.info("Bot shutting down...")
