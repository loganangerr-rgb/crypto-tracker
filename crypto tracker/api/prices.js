import axios from "axios";

export default async function handler(req, res) {
  const coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
  const exchanges = {
    Binance: "https://api.binance.com/api/v3/ticker/bookTicker?symbol=",
    KuCoin: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=",
    Bitget: "https://api.bitget.com/api/spot/v1/market/ticker?symbol="
  };

  const results = [];

  for (const coin of coins) {
    for (const [exchange, url] of Object.entries(exchanges)) {
      try {
        const response = await axios.get(url + coin);
        let bid, ask;

        if (exchange === "Binance") {
          bid = response.data.bidPrice;
          ask = response.data.askPrice;
        } else if (exchange === "KuCoin") {
          bid = response.data.data.bestBid;
          ask = response.data.data.bestAsk;
        } else if (exchange === "Bitget") {
          bid = response.data.data[0].buyOne;
          ask = response.data.data[0].sellOne;
        }

        results.push({
          coin,
          exchange,
          bid: parseFloat(bid),
          ask: parseFloat(ask),
          time: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          coin,
          exchange,
          bid: null,
          ask: null,
          error: error.message
        });
      }
    }
  }

  res.status(200).json(results);
}
