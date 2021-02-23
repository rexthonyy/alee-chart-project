const express = require('express');
//const mongoose = require('mongoose');
const Sentiment = require('sentiment');

const app = express();
app.use(express.json());
app.use(express.static('public'));

sentiment = new Sentiment();

//database connection
const DB_URL = "mongodb://127.0.0.1:27017/alee-chart";

// const MONGODB_URI = process.env.MONGODB_URI || DB_URL;
// mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
// const db = mongoose.connection;
// db.on('error', (error) => console.error(error));
// db.once('open', () => console.log('Connected to mongodb Database'));

const LOCAL_PORT = 3000;
const PORT = process.env.PORT || LOCAL_PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Input : text (string)
// Process : sentiment analysis
// Output : score (0 - 4) (number)
app.post("/", (req, res) => {
	let text = req.body.inputText;
	let result = sentiment.analyze(text).comparative;
	let score = Math.round(aMap(result, -5, 5, 0, 4)); //AFINN produces a rating between -5 and 5
	res.json({ status: 'success', score: score, text: text });
});

function aMap(val, minF, maxF, minT, maxT){
	return minT + (((val - minF)/(maxF - minF)) * (maxT - minT));
}