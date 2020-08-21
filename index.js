var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');

var upload = multer();

var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass + '@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority');

//load config
const config = require('./config');

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static('public'));

//make the screenshots capable
app.use('/screenshots', express.static('screenshots'));

//Require the Router we defined in movies.js
var download = require('./screenshots.js');

//Use the Router on the sub route /movies
app.use('/screenshotdownload', download);

app.listen(80);
