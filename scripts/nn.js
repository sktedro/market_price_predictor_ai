const historyLen = 100; // How many previous candles to give to the NN (does not include the predicted candle)
const futureLen = 1; // How many candles should the NN predict

function Ai(){
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

  const outputs = 1;

  this.model;

  this.newModel = function(){
    // Initialise the model as a sequential neural network
    let model = tf.sequential();
    // Add desired layers to the model
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
    // Compile the model
    model.compile({
      optimizer: tf.train.sgd(0.001),
      loss: 'meanSquaredError'
    });
    return model;
  }

  this.model = this.newModel();


  this.train = async function(){
    while(training){
      console.log("Generating " + chartsPerEpoch + " new data");
      let io = await this.getNewTrainingData(); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

      console.log("Training with new data started");
      let xs = tf.tensor2d(io[0], [chartsPerEpoch, 500]);
      let ys = tf.tensor2d(io[1], [chartsPerEpoch, 1]);
      await this.trainingFn(xs, ys);
      xs.dispose();
      ys.dispose();

      console.log("One of the training inputs has this output : "
        + (io[1][0] / chart[0].priceMultiplier + chart[0].minPrice));
      console.log("And the model predicted it to be this value: "
        + (parseFloat(this.model.predict(tf.tensor2d(io[0][0], [1, 500])).dataSync()) / chart[0].priceMultiplier + chart[0].minPrice));
    }
  }

  this.getNewTrainingData = async function(){
    await getNewCharts(chartsPerEpoch);
    let xs = [];
    let ys = [];
    for(let i = 0; i < chartsPerEpoch; i++){
      let inputs = [];
      for(let j = 0; j < historyLen; j++){
        for(let k = 0; k < 5; k++){ // We give the nn 5 numbers per candle
          inputs[j * 5 + k] = chart[i].candle[j].normData[k]
        }
      }
      xs[i] = inputs;
      ys[i] = chart[i].candle[historyLen].normData[cols.close - 1];
    }
    return [xs, ys];
  }

  this.trainingFn = async function(xs, ys){
    const result = await this.model.fit(xs, ys, {
      batchSize: chartsPerEpoch,
      epochs: epochs,
      shuffle: true,
      verbose: 2
    });
    console.log("Loss of this training cycle: " + result.history.loss[0]);
  }
}
