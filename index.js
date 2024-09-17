const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const appRouter = require("./app-router");

const port = process.env.PORT || 5000;

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "pug");

let server;

if (+port === 443) {
  const options = {
    cert: fs.readFileSync("./security/certificate.crt", "utf8"),
    ca: fs.readFileSync("./security/certificate_ca.crt", "utf8"),
    key: fs.readFileSync("./security/private_key.key", "utf8"),
  }
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
try {
  server.listen(port, () => console.log(`Listening on port ${port}`));
} catch (err) {
  process.exit(0);
  server.listen(port, () => console.log(`Listening on port ${port}`));
}

app.use("/", appRouter);
