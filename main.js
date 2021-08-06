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

let data = [[[]]]; // All loaded data in one 3D array

/*
 * TODO:
 * Button to generate new chart
 * button to predict actual chart
 */

let drawChartToggle = 0;
let training = 0;
let testing = 0;
let epochs = 100;
let epoch;
let chartsPerEpoch = 100;
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

  data = getData(); // Get all market data

  getNewCandles(data);
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
  for (let i = 0; i < 501; i++){
    a[i] = 0;
  }
  let b = tf.tensor(a);
  newModel(b.shape);

}

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
    text("Status: training epoch: " + epoch, 10, baseTextY + 3 * textY);
  }else if(testing){
    fill(0, 0, 155);
    text("Status: testing",  10, baseTextY + 3 * textY);
  }else{
    fill(0, 155, 0);
    text("Status: idle", 10, baseTextY + 3 * textY);
  }
  fill(0);


  if(training){
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
}

function epochsInputFn(){
  epochs = this.value();
}

function chartsPerEpochInputFn(){
  chartsPerEpoch = this.value();
}

function saveButtonFn(){
}

function testButtonFn(){
  testing = !testing;
}

function testInputFn(){
  chartsToTest = this.value();
}

function loadButtonFn(){
}

function drawChartButtonFn(){
  drawChartToggle = !drawChartToggle;
  let col = color(200 - drawChartToggle * 200, drawChartToggle * 200, 0, 255);
  drawChartButton.style('background-color', col);
}

function Candle(){
  this.line;
  this.data;
  this.color;
  this.leftTopCoords;
  this.height;
  this.wickTopCoords;
  this.wickHeight;
  this.normData;

  this.draw = function(candleWidth){
    fill(this.color);
    line(this.wickTopCoords[0], this.wickTopCoords[1], this.wickTopCoords[0], this.wickTopCoords[1] + this.wickHeight);
    rect(this.leftTopCoords[0], this.leftTopCoords[1], candleWidth, this.height);
  }

}

let candle = [];

let tfOutputs = [];
let tfInputs = [];

async function train(){
  for(let i = 0; i < epochs * chartsPerEpoch; i++){
    getNewData(i);
    const history = await model.fit(tfInputs[i], tfOutputs[i], {
      epochs: 1
    });
  }

  /* const xDataset = tf.data.array(tfInputs);
  const yDataset = tf.data.array(tfOutputs);
  const xyDataset = tf.data.zip({
    xs: xDataset,
    ys: yDataset
  }).batch(epochs * chartsPerEpoch).shuffle(epochs * chartsPerEpoch);
  const history = await model.fitDataset(xyDataset, {
    batchSize: 100,
    epochs: 1
  }); */

  // console.log(history.history.loss[0]);
  // traininig = 0;
}

function getNewData(chartNum){
  getNewCandles();
  let xs = [];
  for(let i = 0; i < historyLen; i++){
    for(let j = 0; j < 4; j++){ // We give the nn 5 numbers per candle
      xs[i * 5 + j + 1] = candle[i].data[j + 1] * priceMultiplier;
    }
    xs[i * 5 + 5] = candle[i].data[5] * volMultiplier;
  }
  tfOutputs[chartNum] = tf.tensor(candle[historyLen].data[cols.close]);
  tfInputs[chartNum] = tf.tensor(xs);
  // console.log(xs);
  // return tf.tensor(xs);
}

function doneTraining(){
  console.log("Done");
  training = 0;
}
