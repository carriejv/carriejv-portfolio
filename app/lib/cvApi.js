'use strict';

var express = require('express');
var showdown = require('showdown');
var showdownConverter = new showdown.Converter();
var axios = require('axios');

module.exports.makeRouter = function() {

	var router = express.Router();

    router.get('/github/:repo', (req, res) => {
        axios.get(`https://raw.githubusercontent.com/carriejv/${req.params.repo}/master/README.md`)
        .then(function (response) {
            res.send(showdownConverter.makeHtml(response.data));
        })
        .catch(function (error) {
            console.log(error);
            res.error(500);
        });
    });

    return router;

};