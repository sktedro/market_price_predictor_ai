const lineColor = 150;
const cursorTextColor = [0, 0, 150]; 

let edgePrices = [];
let candleWidth; // Width of a candle including the gap
let realCandleWidth; // .. excluding the gap

function getCandles(data){
  if(data.length < 1){
    console.log("ERROR: No data loaded");
    return -1;
  }

  // Index of the candle to be predicted is right after the last historical one
  let candleToPredict = historyLen;

  // Randomly pick a chart
  // Index of the chart - specifies the pair and interval
  let chart = Math.floor(Math.random(0, data.length - 1));

  // Create the candles
  for(let i = 0; i < historyLen + futureLen; i++){
    candle[i] = new Candle();
  }

  // Pick a random candle from tha chart
  candle[candleToPredict].line = pickLine(data[chart]);

  // Initialize the candles
  for(let i = 0; i < historyLen + futureLen; i++){
    getCandleData(i, data, chart, candleToPredict);
  }
}

// Pick a random line from the data file
function pickLine(chart){
  // Line index of the first usable candle
  let startCandle = historyLen - 1; 
  // Line index of the last usable candle
  let endCandle = chart.length - futureLen;
  // Returns line index
  return Math.floor(Math.random(startCandle / endCandle, 1) * endCandle);
  // return chart.length - 50; // Just for debugging purposes TODO
}

// Get candle data from the file's columns
function getCandleData(i, data, chart, candleToPredict){
  // Calculate the line on which the candle's data is
  candle[i].line = candle[candleToPredict].line - historyLen - futureLen + i;
  // Read the data and convert it
  candle[i].data = data[chart][candle[i].line];
  candle[i].data[cols.time] = convertUnixTime(candle[i].data[cols.time]);
  for(let j = 1; j < candle[i].data.length; j++){
    candle[i].data[j] = int(candle[i].data[j]);
  }
}

// Get the colors of the candles
function getCandleColor(){
  for(let i = 0; i < historyLen + futureLen; i++){
    if(candle[i].data[cols.open] < candle[i].data[cols.close]){
      candle[i].color = [0, 255, 0];
    }else if(candle[i].data[cols.open] > candle[i].data[cols.close]){
      candle[i].color = [255, 0, 0];
    }else{
      candle[i].color = [255, 255, 255];
    }
  }
}

function getCandleWidth(){
  const candleGap = 1;
  candleWidth = chartWidth / (historyLen + futureLen);
  realCandleWidth = candleWidth - (2 * candleGap);
}

// Get the lowest and the highest price from the chart
function getEdgePrices(){
  edgePrices[0] = candle[0].data[cols.low];
  edgePrices[1] = candle[0].data[cols.high];
  for(let i = 1; i < candle.length; i++){
    if(candle[i].data[cols.low] < edgePrices[0]){
      edgePrices[0] = candle[i].data[cols.low];
    }
    if(candle[i].data[cols.high] > edgePrices[1]){
      edgePrices[1] = candle[i].data[cols.high];
    }
  }
}

function drawCandles(){
  const minCandleHeight = 2; // Minimal height of one candle
  const priceLegendItems = 5; // How many horizontal lines (prices) to draw as the price legend
  const timeLegendItems = 5; // How many vertical lines (dates) to draw as the date&time legend

  getEdgePrices(); // Get lowest and highest price for selected candles

  // Width of each candle
  getCandleWidth();

  getCandleColor();

  // Get the coordinates of the candles on the canvas
  getCandleCoords(minCandleHeight);
  
  // Draw price legend (text and lines)
  drawPriceLegend(priceLegendItems);

  // Draw date&time legend (text and lines)
  drawTimeLegend(timeLegendItems);

  // Draw the candles onto the canvas
  stroke(0);
  for(let i = 0; i < candle.length; i++){
    candle[i].draw(realCandleWidth); // - 2 to create a gap between candles
  }
}

// Get coordinates of the candle, wick and their heights
function getCandleCoords(minCandleHeight){
  let yMultiplier = chartHeight / (edgePrices[1] - edgePrices[0]);
  let x;
  let y;
  for(let i = 0; i < candle.length; i++){ // For all candles
    // Get candle height
    candle[i].height = Math.abs(candle[i].data[cols.open] - candle[i].data[cols.close]) * yMultiplier;
    if(candle[i].height < minCandleHeight){
      candle[i].height = minCandleHeight;
    }

    // Get candle coords (of it's left top corner)
    x = Math.round(candleWidth * i) + 1; // +1 for the gap between candles
    if(candle[i].data[cols.close] > candle[i].data[cols.open]){
      y = Math.round((candle[i].data[cols.close] - edgePrices[0]) * yMultiplier);
    }else{
      y = Math.round((candle[i].data[cols.open] - edgePrices[0]) * yMultiplier);
    }
    candle[i].leftTopCoords = [x + chartMargin, chartHeight - y + chartMargin + infoHeight];

    // Get wick height
    candle[i].wickHeight = (candle[i].data[cols.high] - candle[i].data[cols.low]) * yMultiplier;

    // Get wick coordinates
    x += candleWidth / 2;
    y = Math.round((candle[i].data[cols.high] - edgePrices[0]) * yMultiplier);
    candle[i].wickTopCoords = [x + chartMargin - 1, chartHeight - y + chartMargin + infoHeight];
  }
}

function drawCursor(x, y){
  let candleIndex = Math.round((x - chartMargin) / candleWidth);
  if(candleIndex < historyLen + futureLen){
    let priceMultiplier = (edgePrices[1] - edgePrices[0]) / chartHeight;

    // Draw a rectangle behind the price and then the price
    fill(backgroundColor);
    noStroke();
    rect(canvasWidth - priceLegendWidth, y - 16, priceLegendWidth, 16);
    fill(cursorTextColor);
    drawPrice(y, (chartHeight - y + chartMargin) * priceMultiplier + edgePrices[0]);

    //Draw a rectangle behind the date&time and then the date&time
    fill(backgroundColor);
    noStroke();
    rect(x, chartHeight + chartMargin + infoHeight, 125, 16);
    fill(cursorTextColor);
    drawTime(candleIndex);
  }
}

function drawPriceLegend(items){
  let priceMultiplier = (edgePrices[1] - edgePrices[0]) / chartHeight;
  fill(0);
  for(let y = 0; y <= chartHeight ; y += chartHeight / (items - 1)){ // - 1 because one will be at the start and at the end
    drawPrice(y + chartMargin + infoHeight, (chartHeight - y) * priceMultiplier + edgePrices[0]);
  }
}

function drawPrice(y, price){
  stroke(lineColor);
  line(0, y, canvasWidth, y);
  noStroke();
  textSize(12);
  text(price, canvasWidth - priceLegendWidth + 5, y - 5); // + 5 for some offset, - 5 so the number is above the line
}

function drawTimeLegend(items){
  let totalCandles = historyLen + futureLen;
  let step = totalCandles / items;
  fill(0);
  for(let x = 0; x < totalCandles; x = Math.round(x + step)){
    drawTime(x);
  }
}

function drawTime(candleIndex){
  stroke(lineColor);
  strokeWeight(1);
  let leftTop = candle[candleIndex].leftTopCoords[0] - 1; // -1 to draw it more in the center
  let halfCandleWidth = candleWidth / 2;
  line(leftTop + halfCandleWidth, infoHeight, leftTop + halfCandleWidth, canvasHeight + infoHeight);
  noStroke();
  textSize(12)
  text(candle[candleIndex].data[cols.time], leftTop + halfCandleWidth + 5, chartHeight + chartMargin + dateLegendHeight + infoHeight); // + 5 for some offset
}
