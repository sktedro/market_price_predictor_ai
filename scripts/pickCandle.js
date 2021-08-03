function pickCandle(data){
  const minCandleHeight = 2;

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
    for(let j = 0; j < candle[i].data.length; j++){
      candle[i].data = int(candle[i].data);
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

  // Get the coordinates of the candles on the canvas
  getCandleCoords(candle, minCandleHeight);

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

function getCandleCoords(candle, minCandleHeight){
  // Get the lowest and highest price of the chosen candles
  let lowPrice = candle[0].data[cols.low];
  let highPrice = candle[0].data[cols.high];

  let candleWidth = chartWidth / (historyLen + futureLen);
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
  for(let i = 0; i < candle.length; i++){
    // Get candle height
    candle[i].height = Math.abs(candle[i].data[cols.open] - candle[i].data[cols.close]) * heightMultiplier;
    if(candle[i].height < minCandleHeight){
      candle[i].height = minCandleHeight;
    }
    // Get candle coords (of it's left top corner)
    let x = Math.round(candleWidth * i) + 1; // +1 for the gap between candles
    let y;
    if(candle[i].data[cols.close] > candle[i].data[cols.open]){
      y = Math.round((candle[i].data[cols.close] - lowPrice) * yMultiplier);
    }else{
      y = Math.round((candle[i].data[cols.open] - lowPrice) * yMultiplier);
    }
    candle[i].leftTopCoords = [x + chartMargin, chartHeight - y + chartMargin];
  }

  // Get wick coordinates TODO
}
