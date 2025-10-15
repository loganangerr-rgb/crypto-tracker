const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
  try {
    const exchanges = {
      binance: "https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT",
      kucoin: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT",
      gateio: "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=BTC_USDT",
    };

    const results = await Promise.all(
      Object.entries(exchanges).map(async ([name, url]) => {
        try {
          const response = await fetch(url);
          const data = await response.json();

          let buy = null, sell = null;
          if (name === "binance") {
            buy = parseFloat(data.bidPrice);
            sell = parseFloat(data.askPrice);
          } else if (name === "kucoin") {
            buy = parseFloat(data.data.bestBid);
            sell = parseFloat(data.data.bestAsk);
          } else if (name === "gateio") {
            buy = parseFloat(data[0].highest_bid);
            sell = parseFloat(data[0].lowest_ask);
          }

          return { exchange: name, buy, sell };
        } catch (err) {
          console.error(`Error in ${name}:`, err.message);
          return { exchange: name, error: err.message };
        }
      })
    );

    res.status(200).json({ updatedAt: new Date().toISOString(), results });
  } catch (error) {
    console.error("General error:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
