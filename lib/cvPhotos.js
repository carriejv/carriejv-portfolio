'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var ms = require('ms');
var path = require('path');

var availableWidths = [1920, 1440, 1200, 960, 768, 576, 256];

router.get("/:width/:img",function(req, res) {

    var reqWidth = parseInt(req.params.width);

    if(isNaN(reqWidth)) {
        res.redirect('/' + availableWidths[0] + '/' + req.params.img);
    }
    
    while(availableWidths.indexOf(reqWidth) === -1) {
        reqWidth++;
        if(reqWidth > availableWidths[0]) {
            reqWidth = availableWidths[0];
            break;
        }
    }

    var cachePath = path.resolve('static/media/photo/photo-cache/', reqWidth.toString(), req.params.img);

    // Cached image check
    fs.access(cachePath, fs.constants.R_OK, function(err) {
        if(!err) {
            res.sendFile(cachePath, {maxAge: ms('1 month')}, function(err) {
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