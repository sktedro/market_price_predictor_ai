// Data is expected in: data/binance/data/PAIR/PAIR-INTERVAL.csv

function getData(){
  let data = [[[]]];
  const path = "data/binance/data"; // Path with the data
  const pairs = ["BTCUSDT", "ADABTC"]; // Pairs to train on
  const intervals = ["1h"]; // Intervals to train on
  let charts = pairs.length * intervals.length;

  for(let i = 0; i < pairs.length; i++){
    for(let j = 0; j < intervals.length; j++){
      data[--charts] = readData(path + "/" + pairs[i] + "/" + pairs[i] + "-" + intervals[j] + ".csv");
      chartName[charts] = pairs[i] + " - " + intervals[j];
    }
  }
  return data;
}

function readData(path){
  let output = [[]];
  $.ajax({
    type: "GET",
    url: path,
    dataType: "text",
    async: false,
    success: function(data){
      let lines = data.split(/\r\n|\n/);
      for(let i = 0; i < lines.length; i++){
        output[i] = lines[i].split(',');
      }
    }
  });
  return output;
}
