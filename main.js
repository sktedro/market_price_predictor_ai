const chartMargin = 25;

const canvasWidth = 1000;
const priceLegendWidth = 100;
const chartWidth = canvasWidth - chartMargin - priceLegendWidth;

const canvasHeight = 500;
const indicatorsHeight = 100;
const dateLegendHeight = 15;
const chartHeight = canvasHeight - chartMargin - indicatorsHeight - dateLegendHeight;

const backgroundColor = 220;

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


function setup(){
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30);

  data = getData(); // Get all market data
  train();
}

function draw(){
  background(backgroundColor);
  // If the mouse is on the chart, draw the lines, price and time&date
  for(let i = 0; i < candle.length; i++){
    drawCandles();
  }
  if(mouseY > chartMargin && mouseY < chartHeight + chartMargin && mouseX < chartWidth + chartMargin && mouseX > chartMargin){
    drawCursor(mouseX, mouseY);
  }

  

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


  getCandles(data);
  if(candle == -1){
    return -1;
  }


}
