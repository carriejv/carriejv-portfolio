'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var ms = require('ms');
var path = require('path');

var availableWidths = [4096, 1920, 1440, 1200, 960, 768, 576, 256];

router.get("/:width/:img", (req, res) => {

	var reqWidth = parseInt(req.params.width);

	if(isNaN(reqWidth)) {
		res.redirect('/' + availableWidths[0] + '/' + req.params.img);
	}

	var bestMatch = availableWidths[0];
	for(var x of availableWidths) {
		if(Math.abs(reqWidth - bestMatch) > Math.abs(reqWidth - x) && x - reqWidth >= 0) {
			bestMatch = x;
		}
	}

	var cachePath = path.resolve('static/media/photo/photo-cache/', bestMatch.toString(), req.params.img);

	// Cached image check
	fs.access(cachePath, fs.constants.R_OK, (err) => {
		if(!err) {
			res.sendFile(cachePath, {maxAge: ms('1 month')}, (err) => {
				if(err) {
					res.status(500).end();
				}
			});
			return;
		}
		else {
			res.sendStatus(404);
		}
	});
});

module.exports = router;