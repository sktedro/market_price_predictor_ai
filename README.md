# Brief

As I slowly continue studying artificial intelligence, I often catch myself
wondering if it is possible to train a neural network to predict market prices.
Plan is to only use limited price history and maybe some indicators. There are
huge amounts of data freely available on the internet to train the network, so
that's convenient. Also, this will probably be written in JavaScript using the
p5.js library and either TensorFlow.js or ml5 libraries.

Note that this project might not be finished. Ever. It's just something I have
wanted to try for a while now. However, if everything goes well with
TensorFlow.js and maybe if I reach something like 70-80% accuracy (of 
predicting if the next candle's close price will be higher or lower than the 
previous one), I might try essentially the same thing in python using 
TensorFlow.

# Screenshots


# Data

Data is expected in csv format, these are the columns (dates are in unix time):
Open time, open price, high price, low price, close price, volume, close time

I myself will be using data from binance and for that I've written a little
script: https://github.com/sktedro/binance_market_data_downloader

It is by default in the data/binance/binance_market_data_downloader folder and 
downloads data to data/binance/data folder. You can change where should the
application search for the data and what pairs and intervals should it learn
from in 'scripts/csvReader.js'

# Credits and sources
