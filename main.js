const canvasWidth = 1000;
const canvasHeight = 500;
const backgroundColor = [220, 220, 220];

// Columns in the data file - enumeration
const cols = {
  time: 0,
  open: 1,
  high: 2,
  low: 3,
  close: 4,
  vol: 5
};

let data = [[[]]]; // All loaded data in one 3D array


function setup(){
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30);

  data = getData(); // Get all market data
}

function draw(){
  background(backgroundColor);

  // Pick a random candle that will be predicted
  // candleToPredict = [Chart index (which specified pair and interval), line index]
  let candleToPredict = pickCandle(data); 
  if(candleToPredict == -1){
    console.log("ERROR: No data loaded");
  }
  

}
