'use strict';

var express = require('express');
var router = express.Router();

var path = require('path');

module.exports.makeRouter = function(pageId, manifest, rootDir, bg, errorHandler) {

    var router = express.Router();

    router.get("/", (req, res) => {
        var activeCat = manifest.default;
        var activeProj = manifest[activeCat].default;
        res.render(path.resolve('views/project'), {
            activeCat: activeCat,
            activeProj: activeProj,
            projectData: manifest[activeCat].projects[activeProj],
            lang: req.langData,
            manifest: manifest,
            rootDir: rootDir,
            activePage: pageId,
            bg: bg
        });
    });
    
    router.get("/:category", (req, res) => {
        var activeCat;
        if(manifest[req.params.category]) {
            activeCat = req.params.category;
        }
        else {
            errorHandler(req, res, 404);
            return;
        }
        var activeProj = manifest[activeCat].default;
        res.render(path.resolve('views/project'), {
            activeCat: activeCat,
            activeProj: activeProj,
            projectData: manifest[activeCat].projects[activeProj],
            lang: req.langData,
            manifest: manifest,
            rootDir: rootDir,
            activePage: pageId,
            bg: bg
        });
    });

    router.get("/:category/:project", (req, res) => {
        var activeCat;
        if(manifest[req.params.category]) {
            activeCat = req.params.category;
        }
        else {
            errorHandler(req, res, 404);
            return;
        }
        var activeProj;
        if(manifest[activeCat].projects[req.params.project]) {
            activeProj = req.params.project;
        }
        else {
            errorHandler(req, res, 404);
            return;
        }
        res.render(path.resolve('views/project'), { 
            activeCat: activeCat,
            activeProj: activeProj,
            projectData: manifest[activeCat].projects[activeProj],
            lang: req.langData,
            manifest: manifest,
            rootDir: rootDir,
            activePage:pageId,
            bg: bg 
        });
    });

    return router;

};