'use strict';

var express = require('express');
var app = express();
var path = require('path');

var cvRouter = require('./lib/cvRouter.js');
var cvPhotos = require('./lib/cvPhotos.js');

var langFile = require('./lang/lang.json');

var baseTitle = 'Carrie Vrtis';

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

app.listen(process.env.SERVER_LISTEN_PORT, () => {
	console.log("Server listening on " + process.env.SERVER_LISTEN_PORT);
});