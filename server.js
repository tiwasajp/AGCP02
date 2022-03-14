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

// for health check
app.get('/', (req, resp) => {
  //console.log(`/ health check ${req.query}`);
  return resp.sendStatus(200);
});

var texts = [];

app.post("/postText", (req, resp) => {
  var text = (new Buffer.from(req.body.data, "base64")).toString();
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
  var data = JSON.parse((new Buffer.from(req.body.data, "base64")).toString());
  var recordsFiltered = records.filter((record) => {
	return record.key !== data.key;
  });
  records = recordsFiltered;
  records.push(data);
  resp.send((new Buffer.from(JSON.stringify(records))).toString("base64")).end();  
  console.log(`/postKeyValue ${JSON.stringify(data)}`);
  console.table(records);
});

app.get("/getValueByKey", (req, resp) => {
  var key = decodeURI(req.query.key);
  var recordsFiltered = records.filter((record) => {
	return record.key == key;
  });
  if (recordsFiltered.length !== 0) {
  	resp.send((new Buffer.from(JSON.stringify(recordsFiltered[0]))).toString("base64")).end();
  }
  else {
    resp.send((new Buffer.from(JSON.stringify({key:key,value:""}))).toString("base64")).end();
  }
  console.log(`/getValueByKey success ${key} ${JSON.stringify(recordsFiltered)}`);
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
