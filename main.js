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
  background(backgroundColor);
  train();
}

function draw(){

  

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
    stroke(0);
    line(this.wickTopCoords[0], this.wickTopCoords[1], this.wickTopCoords[0], this.wickTopCoords[1] + this.wickHeight);
    rect(this.leftTopCoords[0], this.leftTopCoords[1], candleWidth, this.height);
  }

}

let candle = [];

function train(){


  candle = pickCandle(data);
  if(candle == -1){
    return -1;
  }
  let candleWidth = chartWidth / (historyLen + futureLen);
  candleWidth -= 2; // Create a gap of two pixels between every candle
  for(let i = 0; i < candle.length; i++){
    candle[i].draw(candleWidth);
  }


}
