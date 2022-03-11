/*
 Sample - Web pages & Websocket Server
*/

const express = require("express");
const http = require("http");

//const PORT = 443;
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
  console.log(`/ health check ${req.query}`);
  return resp.sendStatus(200);
});


const data = ["default"];

app.post("/postText", (req, resp) => {
  resp.sendStatus(200).end();
  var text = (new Buffer.from(req.body.data, "base64")).toString().replace(/\"/g, '');
  data.push(text);
  console.log(`/postText ${text}`);
  console.table(data);
});

app.get("/getText", (req, resp) => {
  var text = data[data.length - 1];
  if (text !== "default") data.pop();
  resp.send((new Buffer.from(text)).toString("base64")).end();  
  console.log(`/getText success ${text}`);
  console.table(data);
});

const records = [];

app.post("/postKeyValue", (req, resp) => {
  resp.sendStatus(200).end();
  console.log((new Buffer.from(req.body.data, "base64")).toString());
  var data = JSON.parse((new Buffer.from(req.body.data, "base64")).toString());
  records.push(data);
  console.log(`/postKeyValue ${JSON.stringify(data)}`);
  console.table(records);
});

app.get("/getValueByKey", (req, resp) => {
  var record = records.filter((record) => {
	return req.query.key == record.key;
  });
  resp.send((new Buffer.from(JSON.stringify(record))).toString("base64")).end();  
  console.log(`/getValueByKey success ${JSON.stringify(record)}`);
  console.table(records);
});

