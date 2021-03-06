const express = require('express');
//const mongoose = require('mongoose');
const MonkeyLearn = require('monkeylearn')

const app = express();

app.use(express.json());
app.use(express.static('public'));

const ml = new MonkeyLearn('b1ee507b93b9f75b0d9658bec3f0d42f2344a68c');
let model_id = 'cl_pi3C7JiL';

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
app.post("/", async (req, res) => {
	let data = [req.body.inputText];
	ml.classifiers.classify(model_id, data).then(result => {
		let score = getScore(result.body[0].classifications[0]);
		res.json({status: 'success', score: score, text: result.body[0].text});
	});
});

function getScore(result){
	let tag_name = result.tag_name;
	let confidence = result.confidence * 100;

	if(tag_name == 'Positive'){
		return "positive";
	}else if(tag_name == 'Negative'){
		return "negative";
	}else{
		return "neutral";
	}
}

function aMap(val, minF, maxF, minT, maxT){
	return minT + (((val - minF)/(maxF - minF)) * (maxT - minT));
}