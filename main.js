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

let drawChart = 0;
let training = 0;
let testing = 0;
let epochs = 100;
let chartsPerEpoch;
let chartsToTest;

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
  getCandles(data);
  if(candle == -1){
    return -1;
  }

  if(drawChart){
    for(let i = 0; i < candle.length; i++){
      drawCandles();
    }
  }

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
}

function draw(){
  if(drawChart){
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

  if(drawChart){
    for(let i = 0; i < candle.length; i++){
      drawCandles();
    }
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
  drawChart = !drawChart;
  let col = color(200 - drawChart * 200, drawChart * 200, 0, 255);
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

  this.draw = function(candleWidth){
    fill(this.color);
    line(this.wickTopCoords[0], this.wickTopCoords[1], this.wickTopCoords[0], this.wickTopCoords[1] + this.wickHeight);
    rect(this.leftTopCoords[0], this.leftTopCoords[1], candleWidth, this.height);
  }

}

let candle = [];

function train(){
}
