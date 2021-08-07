const chartMargin = 25;

const canvasWidth = 1000;
const priceLegendWidth = 100;
const chartWidth = canvasWidth - chartMargin - priceLegendWidth;

const canvasHeight = 600;
const infoHeight = 125;
const indicatorsHeight = 0;
const dateLegendHeight = 15;
const chartHeight = canvasHeight - chartMargin - indicatorsHeight - dateLegendHeight - infoHeight;

const backgroundColor = 255;

// Columns in the data file - enumeration
const cols = {
  time: 0,
  open: 1,
  high: 2,
  low: 3,
  close: 4,
  volume: 5
};

let allData = [[[]]]; // All loaded data in one 3D array

/*
 * TODO:
 * Button to generate new chart
 * button to predict actual chart
 */

let drawChartToggle = 1;
let training = 0;
let testing = 0;
let epochs = 10;
let actEpoch;
let chartsPerEpoch = 10000;
let chartsToTest = 1000;

let trainButton;
let testButton;
let epochsInput;
let testInput;
let chartsPerEpochInput;

let upDownAccuracy;
let avgAccuracy;


const baseTextY = 23;
const textY = 25;
const baseButtonY = 10;
const buttonY = 25;

function setup(){
  frameRate(30);

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position(0, 0);

  textSize(12);

  allData = getData(); // Get all market data

  let ret = getNewCandles(allData);
  if(ret == -1){
  }
  drawChart();

  // Line 1
  trainButton = createButton('Start/stop training');
  trainButton.position(10, baseButtonY)
  trainButton.size(150);
  trainButton.mousePressed(trainButtonFn);

  epochsInput = createInput('');
  epochsInput.position(325, baseButtonY);
  epochsInput.size(50);
  epochsInput.input(epochsInputFn);

  chartsPerEpochInput = createInput('');
  chartsPerEpochInput.position(525, baseButtonY);
  chartsPerEpochInput.size(50);
  chartsPerEpochInput.input(chartsPerEpochInputFn);

  saveButton = createButton('Save model');
  saveButton.position(canvasWidth - 160, baseButtonY);
  saveButton.size(150);
  saveButton.mousePressed(saveButtonFn);

  // Line 2
  testButton = createButton('Test');
  testButton.position(10, baseButtonY + buttonY)
  testButton.size(150);
  testButton.mousePressed(testButtonFn);

  testInput = createInput('');
  testInput.position(325, baseButtonY + buttonY);
  testInput.size(50);
  testInput.input(testInputFn);

  loadButton = createButton('Load model');
  loadButton.position(canvasWidth - 160, baseButtonY + buttonY);
  loadButton.size(150);
  loadButton.mousePressed(loadButtonFn);

  // Line 3
  drawChartButton = createButton('Draw the chart?');
  drawChartButton.position(canvasWidth - 160, baseButtonY + 2 * buttonY);
  drawChartButton.size(150);
  drawChartButton.mousePressed(drawChartButtonFn);

  let a = [];
  for (let i = 0; i < 500; i++){
    a[i] = 0;
  }
  let b = tf.tensor(a);
  newModel(b.shape);

}

let trainingHelper = 0;

function draw(){
  if(drawChartToggle){
    background(backgroundColor);
  }else{
    fill(backgroundColor);
    noStroke();
    rect(0, 0, canvasWidth, infoHeight)
  }

  noStroke();
  fill(0);
  // Line 1
  text("Train for epochs (#): ", 200, baseTextY);
  text("Charts per epoch (#): ", 400, baseTextY);
  // Line 2
  text("Test charts (#): ", 200, baseTextY + textY);
  // Line 3
  text("Up or down prediction accuracy: " + upDownAccuracy + "%", 10, baseTextY + 2 * textY);
  text("Average prediction accuracy: " + avgAccuracy + "%", (canvasWidth - 160) / 2, baseTextY + 2 * textY); // - 160 since the "Draw chart" toggle switch is 150px thick and has 10px margin from the right
  // Line 4
  if(training){
    fill(155, 0, 0);
    text("Status: training epoch: " + actEpoch, 10, baseTextY + 3 * textY);
  }else if(testing){
    fill(0, 0, 155);
    text("Status: testing",  10, baseTextY + 3 * textY);
  }else{
    fill(0, 155, 0);
    text("Status: idle", 10, baseTextY + 3 * textY);
  }
  fill(0);


  if(trainingHelper){
    trainingHelper = 0;
    train();
  }

  if(drawChartToggle){
    drawChart();
    // If the mouse is on the chart, draw a cursor
    if(mouseY > chartMargin + infoHeight && mouseY < chartHeight + chartMargin + infoHeight && mouseX < chartWidth + chartMargin && mouseX > chartMargin){
      drawCursor(mouseX, mouseY);
    }
  }
}

function trainButtonFn(){
  training = !training;
  trainingHelper = 1;
  // train();
}

function epochsInputFn(){
  epochs = this.value();
}

function chartsPerEpochInputFn(){
  chartsPerEpoch = this.value();
}

async function saveButtonFn(){
  const saveResult = await model.save('downloads://model');
  console.log("Result of the save process: ");
  console.log(saveResult);
}

function testButtonFn(){
  testing = !testing;
}

function testInputFn(){
  chartsToTest = this.value();
}

async function loadButtonFn(){
  model = await tf.loadLayersModel('http://localhost:8080/model.json');
}

function drawChartButtonFn(){
  drawChartToggle = !drawChartToggle;
  let col = color(200 - drawChartToggle * 200, drawChartToggle * 200, 0, 255);
  drawChartButton.style('background-color', col);
}

function Candle(){
  this.line;
  this.data;
  this.time;
  this.color;
  this.leftTopCoords;
  this.height;
  this.wickTopCoords;
  this.wickHeight;
  this.normData = [];

  this.draw = function(candleWidth){
    fill(this.color);
    line(this.wickTopCoords[0], this.wickTopCoords[1], this.wickTopCoords[0], this.wickTopCoords[1] + this.wickHeight);
    rect(this.leftTopCoords[0], this.leftTopCoords[1], candleWidth, this.height);
  }

}

let candle = [];

let tfInputs = [];
let tfOutputs = [];

async function trainingFn(xs, ys){
  // xs.print();
  const result = await model.fit(xs, ys, {
    batchSize: chartsPerEpoch,
    epochs: epochs,
    shuffle: true,
    verbose: 2,
    callbacks: {
      onEpochEnd: async (epoch) => {
        console.log("Epoch: " + (epoch + 1));
        // actEpoch = epoch;
      }
    }
  });
  console.log("Loss: " + result.history.loss[0]);
}

async function train(){
  while(training){
    console.log("Generating " + chartsPerEpoch + " new data");
    for(let i = 0; i < chartsPerEpoch; i++){
      await getNewData(i);
      // tfInputs[i].print();
    }
    // xs = tf.tensor2d(tfInputs, [1000, 500]);
    // ys = tf.tensor2d(tfOutputs, [1000, 1]);
    let xs = tf.tensor2d(tfInputs, [chartsPerEpoch, 500]);
    let ys = tf.tensor2d(tfOutputs, [chartsPerEpoch, 1]);

    console.log("Training starting now");
    await trainingFn(xs, ys);

    console.log("One of the training inputs has this output:");
    console.log(tfOutputs[0]);
    console.log("And the model predicted it to be this value:");
    model.predict(tf.tensor2d(tfInputs[0], [1, 500])).print();

    xs.dispose();
    ys.dispose();

    console.log("Training finished");
  }
}

async function getNewData(chartNum){
  await getNewCandles();
  let xss = [];
  for(let i = 0; i < historyLen; i++){
    for(let j = 0; j < 4; j++){ // We give the nn 5 numbers per candle
      // xss[i * 5 + j] = candle[i].data[j + 1] * priceMultiplier;
      xss[i * 5 + j] = candle[i].normData[j]
    }
    // xss[i * 5 + 4] = candle[i].data[5] * volMultiplier;
    xss[i * 5 + 4] = candle[i].normData[4]
  }
  // tfInputs[chartNum] = tf.tensor2d(xs, [1, 500]);
  // tfOutputs[chartNum] = tf.tensor2d([candle[historyLen].data[cols.close]]);
  tfInputs[chartNum] = xss;
  tfOutputs[chartNum] = candle[historyLen].normData[cols.close - 1];
  // console.log(tfOutputs[chartNum]);
  // console.log(xs);
  // return tf.tensor(xs);
}
