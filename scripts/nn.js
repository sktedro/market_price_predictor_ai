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
  * Volatility (average candle % change)?
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
  * Open price
  * Close price
  * High price
  * Low price
  */

  const outputs = 4;

  this.model;
  this.learningRate = 0.0001;

  this.newModel = function(){
    // Initialise the model as a sequential neural network
    this.model = tf.sequential();
    // Add desired layers to the model
    this.model.add(tf.layers.dense({
      units: 192,
      activation: "relu",
      inputShape: [inputs]
    }));
    this.model.add(tf.layers.dense({
      units: 128,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: 64,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: 32,
      activation: "relu"
    }));
    this.model.add(tf.layers.dense({
      units: outputs
    }));
    // Compile the model
    this.compileModel();
    return model;
  }

  this.compileModel = function(){
    this.model.compile({
      optimizer: tf.train.sgd(this.learningRate),
      loss: 'meanSquaredError'
    });
  }

  this.test = async function(){
    let accuracySum = 0;
    let singlePriceAccuracy;

    let expectedUp = Number.MIN_VALUE;
    let expectedDown = Number.MIN_VALUE;
    let predictedUp = Number.MIN_VALUE;
    let predictedDown = Number.MIN_VALUE;

    console.log("Generating " + chartsToTest + " new data");
    let io = await this.getNewTrainingData(chartsToTest); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

    console.log("Testing with new data started");
    let xs = tf.tensor2d(io[0], [chartsToTest, inputs]);
    let ys = tf.tensor2d(io[1], [chartsToTest, outputs]);

    for(let i = 0; i < chartsToTest; i++){
      let expectedOutput = io[1][i];
      for(let j = 0; j < outputs; j++){
        expectedOutput[j] = expectedOutput[j] / chart[0].priceMultiplier + chart[0].minPrice;
      }
      if(expectedOutput[3] > expectedOutput[0]){ // If close price is higher than the open price
        expectedUp++;
      }else if(expectedOutput[3] < expectedOutput[0]){ // If close price is lower
        expectedDown++;
      }

      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();
      for(let j = 0; j < outputs; j++){
        predictedOutput[j] = predictedOutput[j] / chart[0].priceMultiplier + chart[0].minPrice;
      }
      if(predictedOutput[3] > predictedOutput[0]){
        predictedUp++;
      }else if(predictedOutput[3] < predictedOutput[0]){
        predictedDown++;
      }

      for(let j = 1; j < 4; j++){
        singlePriceAccuracy = expectedOutput[j] / predictedOutput[j];
        if(singlePriceAccuracy > 1){
          singlePriceAccuracy = 1 / singlePriceAccuracy;
        }
        accuracySum += singlePriceAccuracy;
      }

    }
    xs.dispose();
    ys.dispose();

    console.log("Expected red candle:   " + expectedDown);
    console.log("Expected green candle: " + expectedUp);

    let upAccuracy = expectedUp / predictedUp;
    let downAccuracy = expectedDown / predictedDown;
    if(upAccuracy > 1){
      upAccuracy = 1 / upAccuracy;
    }
    if(downAccuracy > 1){
      downAccuracy = 1 / downAccuracy;
    }
    upDownAccuracy = (((upAccuracy + downAccuracy) / 2) * 100).toFixed(2);
    //SHOULD BE CALCULATED DIFFERENTLY
    avgAccuracy = ((accuracySum / (chartsToTest * 3)) * 100).toFixed(2); // * 3 because we measure accuracy of predicting candle close, high and low

    testing = 0;
  }

  this.train = async function(){
    while(training && (cycles == 0 || (cycles - cyclesTrained) != 0)){
      console.log("Generating " + chartsPerEpoch + " new data");
      let io = await this.getNewTrainingData(chartsPerEpoch); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

      console.log("Training with new data started");
      let xs = tf.tensor2d(io[0], [chartsPerEpoch, inputs]);
      let ys = tf.tensor2d(io[1], [chartsPerEpoch, outputs]);
      await this.trainingFn(xs, ys);
      xs.dispose();
      ys.dispose();

      console.log("Testing the AI on chart with index = 0:");
      console.log("\tExpected output:");
      for(let i = 0; i < 4; i++){
        console.log("\t\t" + (io[1][0][i] / chart[0].priceMultiplier + chart[0].minPrice));
      }
      console.log("\tPredicted output:");
      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();
      for(let i = 0; i < 4; i++){
        console.log("\t\t" + (predictedOutput[i] / chart[0].priceMultiplier + chart[0].minPrice));
      }

      if(cycles - cyclesTrained != 0){
        cyclesTrained++;
      }
    }
    training = 0;
    cyclesTrained = 0;
  }

  this.getNewTrainingData = async function(amount){
    await getNewCharts(amount);
    let xs = [];
    let ys = [];
    for(let i = 0; i < amount; i++){
      let inputData = [];
      let outputData = [];
      for(let j = 0; j < historyLen; j++){
        for(let k = 0; k < 5; k++){ // We give the nn 5 numbers per candle
          inputData[j * 5 + k] = chart[i].candle[j].normData[k]
        }
      }
      for(let j = 0; j < 4; j++){
        outputData[j] = chart[i].candle[historyLen].normData[j];
      }
      xs[i] = inputData;
      ys[i] = outputData;
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
