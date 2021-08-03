function pickCandle(data){
  if(data.length > 0){
    // Index of the chart - specifies the pair and interval
    let chart = Math.floor(Math.random(0, data.length - 1));
    // Line index of the first usable candle
    let startCandle = historyLen - 1; 
    // Line index of the last usable candle
    let endCandle = data[chart].length - futureLen + 1;
    // Returns [Chart index (which specified pair and interval), line index]
    return [chart, Math.floor(Math.random(startCandle / endCandle, 1) * endCandle)];
  }
  return -1;
}
