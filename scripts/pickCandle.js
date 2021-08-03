function pickCandle(data){
  const minCandleHeight = 2;
  const priceLegendItems = 5;
  const horizontalLineColor = 100;
  const timeLegendItems = 5;
  const verticalLineColor = 100;

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
  let candle = [];
  for(let i = 0; i < historyLen + futureLen; i++){
    candle[i] = new Candle();
  }

  // Pick a random candle from tha chart
  candle[candleToPredict].line = pickLine(data[chart]);

  // Initialize the candles
  for(let i = 0; i < historyLen + futureLen; i++){
    // Calculate the line on which the candle's data is
    candle[i].line = candle[candleToPredict].line - historyLen + i;
    // Get candle data from the file's columns
    candle[i].data = data[chart][candle[i].line];
    candle[i].data[cols.time] = convertUnixTime(candle[i].data[cols.time]);
    for(let j = 1; j < candle[i].data.length; j++){
      candle[i].data[j] = int(candle[i].data[j]);
    }
    // Get the color of the candle
    if(candle[i].data[cols.open] < candle[i].data[cols.close]){
      candle[i].color = [0, 255, 0];
    }else if(candle[i].data[cols.open] > candle[i].data[cols.close]){
      candle[i].color = [255, 0, 0];
    }else{
      candle[i].color = [255, 255, 255];
    }
  }

  // Get the lowest and highest price of the chosen candles
  let lowPrice = candle[0].data[cols.low];
  let highPrice = candle[0].data[cols.high];

  let candleWidth = chartWidth / (historyLen + futureLen);

  // Get the coordinates of the candles on the canvas
  getCandleCoords(candle, candleWidth, minCandleHeight, lowPrice, highPrice);
  
  drawPriceLegend(priceLegendItems, lowPrice, highPrice, horizontalLineColor);
  drawTimeLegend(timeLegendItems, candle, candleWidth, verticalLineColor);

  return candle;
}

function pickLine(chart){
  // Line index of the first usable candle
  let startCandle = historyLen - 1; 
  // Line index of the last usable candle
  let endCandle = chart.length - futureLen;
  // Returns line index
  return Math.floor(Math.random(startCandle / endCandle, 1) * endCandle);
}

function getCandleCoords(candle, candleWidth, minCandleHeight, lowPrice, highPrice){

  for(let i = 0; i < candle.length; i++){
    if(candle[i].data[cols.high] > highPrice){
      highPrice = candle[i].data[cols.high];
    }
    if(candle[i].data[cols.low] < lowPrice){
      lowPrice = candle[i].data[cols.low];
    }
  }

  let heightMultiplier = chartHeight / (highPrice - lowPrice);
  let yMultiplier = chartHeight / (highPrice - lowPrice);
  let x;
  let y;
  for(let i = 0; i < candle.length; i++){
    // Get candle height
    candle[i].height = Math.abs(candle[i].data[cols.open] - candle[i].data[cols.close]) * heightMultiplier;
    if(candle[i].height < minCandleHeight){
      candle[i].height = minCandleHeight;
    }
    // Get candle coords (of it's left top corner)
    x = Math.round(candleWidth * i) + 1; // +1 for the gap between candles
    if(candle[i].data[cols.close] > candle[i].data[cols.open]){
      y = Math.round((candle[i].data[cols.close] - lowPrice) * yMultiplier);
    }else{
      y = Math.round((candle[i].data[cols.open] - lowPrice) * yMultiplier);
    }
    candle[i].leftTopCoords = [x + chartMargin, chartHeight - y + chartMargin];

    // Get wick coordinates
    candle[i].wickHeight = (candle[i].data[cols.high] - candle[i].data[cols.low]) * heightMultiplier;
    x += Math.round(candleWidth / 2);
    y = Math.round((candle[i].data[cols.high] - lowPrice) * yMultiplier);
    candle[i].wickTopCoords = [x + chartMargin, chartHeight - y + chartMargin];
  }
}

function drawPriceLegend(items, lowPrice, highPrice, lineColor){
  let priceMultiplier = chartHeight / (highPrice - lowPrice);
  textSize(12);
  for(let y = chartMargin; y <= chartHeight + chartMargin; y += chartHeight / (items - 1)){ // - 1 because one will be at the start and at the end
    stroke(lineColor);
    line(0, y, canvasWidth, y);
    noStroke();
    text((chartHeight - y) * priceMultiplier + lowPrice, canvasWidth - priceLegendWidth + 5, y - 5); // + 5 for some offset, - 5 so the number is above the line
  }
}

function drawTimeLegend(items, candle, candleWidth, lineColor){
  let totalCandles = historyLen + futureLen;
  let step = totalCandles / items;
  textSize(12)
  for(let x = 0; x < totalCandles; x = Math.round(x + step)){
    stroke(lineColor);
    line(candle[x].leftTopCoords[0] + candleWidth / 2, 0, candle[x].leftTopCoords[0] + candleWidth / 2, canvasHeight);
    noStroke();
    text(candle[x].data[cols.time], candle[x].leftTopCoords[0] + candleWidth / 2 + 5, chartHeight + chartMargin + dateLegendHeight); // + 5 for some offset, - 15 so the number is below the lowest line
  }
}

function convertUnixTime(input){
  let date = new Date(input * 1); // No idea why that * 1 is necessary. It doesn't work without it tho
  let hours = String(date.getHours());
  let minutes = date.getMinutes();
  date = date.toLocaleDateString('en-US');
  if(minutes < 10){
    minutes = "0" + String(minutes);
  }else{
    minutes = String(minutes);
  }
  return date + " " + hours + ":" + minutes;
}
