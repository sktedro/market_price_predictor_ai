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

  this.test = async function(chartsAmount){
    let accuracySum = 0;
    let singlePriceAccuracy;

    let upDownAccuracySum = 0;

    console.log("Generating " + chartsAmount + " new data");
    let io = await this.getNewTrainingData(chartsAmount); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

    console.log("Testing with new data started");
    let xs = tf.tensor2d(io[0], [chartsAmount, inputs]);
    let ys = tf.tensor2d(io[1], [chartsAmount, outputs]);

    for(let i = 0; i < chartsAmount; i++){
      let expectedOutput = io[1][i];
      for(let j = 0; j < outputs; j++){
        expectedOutput[j] = expectedOutput[j];
      }

      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();
      for(let j = 0; j < outputs; j++){
        predictedOutput[j] = predictedOutput[j];
      }

      if(i == 0){ // If this is the first chart from the ones being tested, also print the data
        this.printTestData(expectedOutput, predictedOutput);
        this.drawTestPrediction(predictedOutput);
      }

      if(expectedOutput[3] > expectedOutput[0] && predictedOutput[3] > predictedOutput[0]){ // If close price is higher than the open price
        upDownAccuracySum += 1;
      }else if(expectedOutput[3] < expectedOutput[0] && predictedOutput[3] < predictedOutput[0]){ // If close price is lower
        upDownAccuracySum += 1;
      }else if(expectedOutput[3] == expectedOutput[0] && predictedOutput[3] == predictedOutput[0]){ // If close price is the same
        upDownAccuracySum += 1;
      }

      for(let j = 1; j < 4; j++){
        let expectedPrice = expectedOutput[j] / chart[i].priceMultiplier + chart[i].minPrice;
        let predictedPrice = predictedOutput[j] / chart[i].priceMultiplier + chart[i].minPrice;
        accuracySum += Math.abs((1 / (expectedPrice / predictedPrice)) - 1);
      }
    }
    xs.dispose();
    ys.dispose();

    upDownAccuracy = ((upDownAccuracySum / chartsAmount) * 100).toFixed(8);

    // SHOULD BE CALCULATED DIFFERENTLY?
    avgAccuracy = ((accuracySum / (chartsAmount * 3)) * 100).toFixed(8); // * 3 because we measure accuracy of predicting candle close, high and low

    testing = 0;
  }

  this.drawTestPrediction = function(predictedOutput){
    let candleIndex = historyLen + futureLen;
    let data = [];
    data[0] = 0;
    for(let i = 0; i < 4; i++){
      data[i + 1] = predictedOutput[i] / chart[0].priceMultiplier + chart[0].minPrice;
    }
    chart[0].addNewCandle(data);
    chart[0].candle[candleIndex].color = [0, 0, 255];
  }

  this.printTestData = function(expectedOutput, predictedOutput){
    console.log("\tExpected output for chart with index = 0:");
    for(let i = 0; i < 4; i++){
      console.log("\t\t" + (expectedOutput[i] / chart[0].priceMultiplier + chart[0].minPrice));
    }
    console.log("\tPredicted output:");
    for(let i = 0; i < 4; i++){
      console.log("\t\t" + (predictedOutput[i] / chart[0].priceMultiplier + chart[0].minPrice));
    }
  }

  this.train = async function(){
    while(training && (cycles == 0 || (cycles - cyclesTrained) != 0)){
      console.log("================================================================================");
      console.log("New training cycle starting");
      console.log("Generating " + chartsPerEpoch + " new data");
      let io = await this.getNewTrainingData(chartsPerEpoch); // Inputs and outputs of the neural net (almost. They need to be converted to tensors)

      console.log("Testing with one sample. The blue candle on the chart is AI's prediction of the last candle");
      let predictedOutput = this.model.predict(tf.tensor2d(io[0][0], [1, inputs])).dataSync();
      this.drawTestPrediction(predictedOutput);
      this.printTestData(io[1][0], predictedOutput);

      console.log("Training with new data started");
      let xs = tf.tensor2d(io[0], [chartsPerEpoch, inputs]);
      let ys = tf.tensor2d(io[1], [chartsPerEpoch, outputs]);
      await this.trainingFn(xs, ys);
      xs.dispose();
      ys.dispose();


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
          inputData[j * 5 + k] = chart[i].candle[j].normData[k];
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
