const historyLen = 100; // How many previous candles to give to the NN
const futureLen = 1; // How many candles should the NN predict

/*
 * Inputs (all values should be normalized - range within 0 and 1):
 *
 * For every candle:
 *   Open price
 *   High price
 *   Low price
 *   Close price
 *   Volume
 * Time (minutes from 00:00) - for example 01:30 = 1*60 + 30
 * Timeframe (interval of candles) in minutes?
 * Indicators:?
 *   MA
 *   RSI
 *   ...
 */
const inputs = historyLen * 5 + 1;
