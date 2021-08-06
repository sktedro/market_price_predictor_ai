const lineColor = 150;

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

// Get the color of the candle
function getCandleColor(i){
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
  return chartWidth / (historyLen + futureLen);
}

function drawCandles(){
  const minCandleHeight = 2; // Minimal height of one candle
  const priceLegendItems = 5; // How many horizontal lines (prices) to draw as the price legend
  const timeLegendItems = 5; // How many vertical lines (dates) to draw as the date&time legend

  let edgePrices = getEdgePrices(); // Get lowest and highest price for selected candles

  // Width of each candle
  let candleWidth = getCandleWidth();

  getCandleColor();

  // Get the coordinates of the candles on the canvas
  getCandleCoords(minCandleHeight, edgePrices);
  
  // Draw price legend (text and lines)
  drawPriceLegend(priceLegendItems, edgePrices);

  // Draw date&time legend (text and lines)
  drawTimeLegend(timeLegendItems);

  // Draw the candles onto the canvas
  stroke(0);
  strokeWeight(1);
  for(let i = 0; i < candle.length; i++){
    candle[i].draw(candleWidth - 2); // - 2 to create a gap between candles
  }
}

// Pick a random line from the data file
function pickLine(chart){
  // Line index of the first usable candle
  let startCandle = historyLen - 1; 
  // Line index of the last usable candle
  let endCandle = chart.length - futureLen;
  // Returns line index
  // return Math.floor(Math.random(startCandle / endCandle, 1) * endCandle);
  return chart.length - 50; // Just for debugging purposes TODO
}

// Get coordinates of the candle, wick and their heights
function getCandleCoords(minCandleHeight, edgePrices){
  let candleWidth = getCandleWidth();
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
    candle[i].leftTopCoords = [x + chartMargin, chartHeight - y + chartMargin];
    // Get wick height
    candle[i].wickHeight = (candle[i].data[cols.high] - candle[i].data[cols.low]) * yMultiplier;
    // Get wick coordinates
    x += candleWidth / 2;
    y = Math.round((candle[i].data[cols.high] - edgePrices[0]) * yMultiplier);
    candle[i].wickTopCoords = [x + chartMargin - 1, chartHeight - y + chartMargin];
  }
}

function drawCursor(x, y){
  let edgePrices = getEdgePrices();
  let priceMultiplier = (edgePrices[1] - edgePrices[0]) / chartHeight;

  // Draw a rectangle behind the price
  fill(backgroundColor);
  noStroke();
  rect(canvasWidth - priceLegendWidth, y - 16, priceLegendWidth, 16);
  fill(0, 0, 150);
  drawPrice(y, (chartHeight - y + chartMargin) * priceMultiplier + edgePrices[0]);

  //Draw a rectangle behind the date&time
  fill(backgroundColor);
  noStroke();
  rect(x, chartHeight + chartMargin, 100, 16);
  let candleIndex = Math.round((x - chartMargin) / getCandleWidth());
  fill(0, 0, 150);
  drawTime(candleIndex);

}

function getEdgePrices(){
  // Get the lowest and highest price from the chart
  let lowPrice = candle[0].data[cols.low];
  let highPrice = candle[0].data[cols.high];
  for(let i = 1; i < candle.length; i++){
    if(candle[i].data[cols.low] < lowPrice){
      lowPrice = candle[i].data[cols.low];
    }
    if(candle[i].data[cols.high] > highPrice){
      highPrice = candle[i].data[cols.high];
    }
  }
  return [lowPrice, highPrice];
}

function getPriceMultiplier(edgePrices){
  return (edgePrices[1] - edgePrices[0]) / chartHeight;
}

function drawPrice(y, price){
  stroke(lineColor);
  line(0, y, canvasWidth, y);
  noStroke();
  textSize(12);
  text(price, canvasWidth - priceLegendWidth + 5, y - 5); // + 5 for some offset, - 5 so the number is above the line
}

function drawTime(candleIndex){
  let candleWidth = getCandleWidth();
  stroke(lineColor);
  let leftTop = candle[candleIndex].leftTopCoords[0] - 1; // -1 to draw it more in the center
  let halfCandleWidth = candleWidth / 2;
  line(leftTop + halfCandleWidth, 0, leftTop + halfCandleWidth, canvasHeight);
  noStroke();
  textSize(12)
  text(candle[candleIndex].data[cols.time], leftTop + halfCandleWidth + 5, chartHeight + chartMargin + dateLegendHeight); // + 5 for some offset, - 15 so the number is below the lowest line
}

function drawPriceLegend(items, edgePrices){
  let priceMultiplier = (edgePrices[1] - edgePrices[0]) / chartHeight;
  fill(0);
  for(let y = 0; y <= chartHeight ; y += chartHeight / (items - 1)){ // - 1 because one will be at the start and at the end
    drawPrice(y + chartMargin, (chartHeight - y) * priceMultiplier + edgePrices[0]);
  }
}

function drawTimeLegend(items){
  let candleWidth = getCandleWidth();
  let totalCandles = historyLen + futureLen;
  let step = totalCandles / items;
  fill(0);
  for(let x = 0; x < totalCandles; x = Math.round(x + step)){
    fill(0);
    drawTime(x, candleWidth);
  }
}

