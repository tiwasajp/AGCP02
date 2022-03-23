/*
 Sample - Web Services
*/

const express = require("express");
const http = require("http");

const PORT = 8080;

const app = express();
app.use(express.static("public"));
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.set("port", process.env.PORT || PORT);
app.set("view engine", "ejs");
app.set("trust proxy", true);
module.exports = app;

http.createServer(app).listen(PORT, () => {console.log(`Server listening on port ${PORT}`);});

// health check for instance group/container
app.get('/', (req, resp) => {
  //console.log(`/ health check ${req.query}`);
  return resp.sendStatus(200);
});

var texts = [];

app.post("/postText", (req, resp) => {
  const text = (new Buffer.from(req.body.data, "base64")).toString();
  texts.push(text);
  resp.send((new Buffer.from(JSON.stringify(texts))).toString("base64")).end();
  console.log(`/postText ${text}`);
  console.table(texts);
});

app.get("/getTextFIFO", (req, resp) => {
  var text = "";
  if (texts.length !== 0) {
    text = texts[texts.length - 1];
    texts.pop();
  }
  resp.send((new Buffer.from(JSON.stringify({text:text,texts:texts}))).toString("base64")).end();
  console.log(`/getTextFIFO success ${text}`);
  console.table(texts);
});

app.get("/getTextLIFO", (req, resp) => {
  var text = "";
  if (texts.length !== 0) {
    text = texts[0];
    texts.shift();
  }
  resp.send((new Buffer.from(JSON.stringify({text:text,texts:texts}))).toString("base64")).end();
  console.log(`/getTextLIFO success ${text}`);
  console.table(texts);
});

app.get("/getTexts", (req, resp) => {
  resp.send((new Buffer.from(JSON.stringify(texts))).toString("base64")).end();  
  console.log(`/getTexts success ${JSON.stringify(texts)}`);
  console.table(texts);
});

app.post("/updateTexts", (req, resp) => {
  resp.sendStatus(200).end();
  texts = JSON.parse((new Buffer.from(req.body.data, "base64")).toString());
  console.log(`/updateTexts ${JSON.stringify(texts)}`);
  console.table(texts);
});

app.get("/deleteTexts", (req, resp) => {
  texts = [];
  resp.end();  
  console.log(`/deleteTexts success}`);
  console.table(texts);
});


///////////////////////////////////////////////////////////////////////////////////////////////

var records = [];

app.post("/postKeyValue", (req, resp) => {
  const data = JSON.parse((new Buffer.from(req.body.data, "base64")).toString());
  var filtered = records.filter((record) => {
	return record.key == data.key;
  });
  records.push({key:data.key, value:data.value, attr:{idx:(filtered.length + 1), date:(new Date()), valid:true}});
  resp.send((new Buffer.from(JSON.stringify(records))).toString("base64")).end();  
  console.log(`/postKeyValue ${JSON.stringify(data)}`);
  console.table(records);
});

app.get("/getValueByKey", (req, resp) => {
  const key = decodeURI(req.query.key);
  var filtered = records.filter((record) => {
	return record.key == key;
  });
  filtered.sort((first, second) => {
  	return second.attr.idx - first.attr.idx;
  });
  if (filtered.length !== 0) {
  	resp.send((new Buffer.from(JSON.stringify(filtered))).toString("base64")).end();
  }
  else {
    resp.send((new Buffer.from(JSON.stringify({key:key,value:""}))).toString("base64")).end();
  }
  console.log(`/getValueByKey success ${JSON.stringify(filtered)}`);
  console.table(records);
});

app.get("/getRecords", (req, resp) => {
  resp.send((new Buffer.from(JSON.stringify(records))).toString("base64")).end();  
  console.log(`/getRecords success ${JSON.stringify(records)}`);
  console.table(records);
});

app.post("/updateRecords", (req, resp) => {
  resp.sendStatus(200).end();
  records = JSON.parse((new Buffer.from(req.body.data, "base64")).toString());
  console.log(`/updateRecords ${JSON.stringify(records)}`);
  console.table(records);
});

app.get("/deleteRecords", (req, resp) => {
  records = [];
  resp.end();  
  console.log(`/deleteRecords success}`);
  console.table(records);
});

///////////////////////////////////////////////////////////////////////////////////////////////

//　GCPのNoSQL（Unstructuredのレコードのデータベース）にアクセスするためのAPI
const admin = require('firebase-admin');
admin.initializeApp();
 
app.get("/getValueByKeyFromFirestore", (req, resp) => {
  const key = decodeURI(req.query.key);
  const db = admin.firestore();
  db.collection('weather').get().then((snapshot) => {
	snapshot.forEach((doc) => {
	  if (doc.id === key) {
		console.log(`${doc.id} => ${doc.data().today}`);
		resp.send((new Buffer.from(JSON.stringify([{key:key,value:doc.data().today}]))).toString("base64")).end();
      }
	});
  }).catch((error) => {
    console.log("Error getting documents", error);
    resp.send((new Buffer.from("エラー")).toString("base64")).end();
  })
});
 
