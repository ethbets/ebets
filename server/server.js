'use strict';

const _ = require('lodash');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const request = require('request');
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;

const app = express();
app.use(cors());
app.use(bodyParser.json({ type: 'application/json' }));

const jsonParser = bodyParser.json();

function makeRequest (httpVerb, requestedUrl, config) {
  const headers = (_.isUndefined(config)) ? { 'Content-Type': 'application/json' } : config.headers;
  const options = { method: httpVerb, uri: requestedUrl, headers };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) { return reject(error); }
      response.payload = body;
      return resolve(response);
    });
  }).catch(() => { /* foda-se */ });
}

const root = express.Router();

root.post('/xpath', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  makeRequest('GET', req.body.url.toString('utf-8')).then((response) => {
    if (response.statusCode === 200) {
      const payload = response.payload.toString();
      const doc = new Dom().parseFromString(payload);
      const value = xpath.select(req.body.xpath, doc)[0].nodeValue;
      res.json({ xpathResult: value });
    }
  });
});

app.use('/', root);

app.listen(8080, () => {
  console.log('server listening on port 8080');
});

