'use strict';

var express = require('express');
var app = express();
var path = require('path');

var cvRouter = require('./lib/cvRouter.js');
var cvPhotos = require('./lib/cvPhotos.js');

var langFile = require('./lang/lang.json');

app.set('view engine', 'pug');

var localeRouter = cvRouter.makeRouter(langFile);
var enRouter = cvRouter.makeRouter(langFile, 'en');
var esRouter = cvRouter.makeRouter(langFile, 'es');

app.use('/favicon.ico', express.static('static/favicon.ico'));
app.use('/static/media/photo/photo-cache', cvPhotos);
app.use('/static', express.static('static'));

app.use('/en', enRouter);
app.use('/es', esRouter);
app.use('/', localeRouter);

let port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Server listening on " + port);
});