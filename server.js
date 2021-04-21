const express = require('express');
const MonkeyLearn = require('monkeylearn')
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const creds = require('./client_secret.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const ml = new MonkeyLearn('b1ee507b93b9f75b0d9658bec3f0d42f2344a68c');
let model_id = 'cl_pi3C7JiL';

const LOCAL_PORT = 3000;
const PORT = process.env.PORT || LOCAL_PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.post("/", async (req, res) => {
	let docId = req.body.docId;
	let sheetIndex = req.body.sheetIndex;
	
	accessSpreadsheet(res, docId, sheetIndex);
});

async function accessSpreadsheet(res, docId, sheetIndex) {
	const doc = new GoogleSpreadsheet(docId);
	await promisify(doc.useServiceAccountAuth)(creds);
	const info = await promisify(doc.getInfo)();
	const sheet = info.worksheets[sheetIndex];
	const rows = await promisify(sheet.getRows)({
		offset: 1
	});
	
	let sentiments = [];
	rows.forEach(row => {
		let data = [row.message];
		ml.classifiers.classify(model_id, data).then(result => {
			let score = getScore(result.body[0].classifications[0]);
			sentiments.push({
				message: result.body[0].text,
				score: score
			});
			if(sentiments.length == rows.length){
				res.json({status: 'success', result: sentiments});
			}
		});
	});
}

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