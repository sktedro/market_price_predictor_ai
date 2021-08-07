const historyLen = 100; // How many previous candles to give to the NN (does not include the predicted candle)
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
 * Day of the week
 * Timeframe (interval of candles) in minutes?
 * Indicators:?
 *   MA
 *   RSI
 *   STOCH
 *   OBV
 *   ...
 */
const inputs = historyLen * 5;

/*
 * Outputs:
 * Close price
 * High price?
 * Low price?
 */

let model;

function newModel(shape){
  model = tf.sequential();
  model.add(tf.layers.dense({
    units: 128,
    activation: "relu",
    inputShape: [500]
  }));
  model.add(tf.layers.dense({
    units: 64,
    activation: "relu"
  }));
  model.add(tf.layers.dense({
    units: 32,
    activation: "relu"
  }));
  model.add(tf.layers.dense({
    units: 1
  }));

  model.compile({
    optimizer: tf.train.sgd(0.0001),
    loss: 'meanSquaredError'
  });
}

