'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var dns = require('dns');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var autoIncr = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
process.env.MONGOLAB_URI = "mongodb://mouri11:sukanya96@ds159400.mlab.com:59400/db_fcc";
var connection = mongoose.connect(process.env.MONGOLAB_URI);
//autoIncr.initialize(connection);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var urlSchema = new Schema({
  url: {type: String, required: true},
  short_url: Number
});
urlSchema.plugin(autoIncr, {inc_field: 'short_url'});

var Url_model = mongoose.model('Url_model', urlSchema);

app.post("/api/shorturl/new", function(req,res){
  var newUrl = req.body.url.replace(/https?:\/\//gi, "");
  const url = new Url_model({url: newUrl});
  dns.lookup(newUrl,function(err, address, family) {
    if(err) {
      console.log(err);
      res.json({"error": "invalid URL"});
    }
    else url.save((err,data) => err ? console.log(err) : res.json({"original_url": data.url, "short_url": data.short_url}));
  });
});
app.get("/api/shorturl/:short_url", function(req,res) {
  Url_model.findOne({short_url: req.params.short_url}, (err, data) => err ? console.log(err) : res.redirect("https://" + data.url));
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
