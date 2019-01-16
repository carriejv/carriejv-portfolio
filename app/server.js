'use strict';

var express = require('express');
var app = express();

var cvRouter = require('./lib/cvRouter.js');
var cvPhotos = require('./lib/cvPhotos.js');
var cvApi = require('./lib/cvApi.js');

var langFile = require('./lang/lang.json');
var faIcons = require('./lang/fa-icons.json');

app.set('view engine', 'pug');

var manifests = {
	code: require('./static/media/code/manifest.json'),
	design: require('./static/media/design/manifest.json'),
	photo: require('./static/media/photo/manifest.json'),
	writing: require('./static/media/writing/manifest.json')
};

var localeRouter = cvRouter.makeRouter(manifests, langFile, faIcons);
var enRouter = cvRouter.makeRouter(manifests, langFile, faIcons, 'en');
var esRouter = cvRouter.makeRouter(manifests, langFile, faIcons, 'es');
var apiRouter = cvApi.makeRouter();

app.use('/favicon.ico', express.static('static/favicon.ico'));
app.use('/static/media/photo/photo-cache', cvPhotos);
app.use('/static', express.static('static'));

app.use('/api', apiRouter);
app.use('/en', enRouter);
app.use('/es', esRouter);
app.use('/', localeRouter);

let port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Server listening on " + port);
});