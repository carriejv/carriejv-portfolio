'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');

var locale = require('locale');
var langSupported = ['en', 'es'];
var langDefault = 'en';

var commandLineOptions = [
    {name: 'nomail', alias: 'm', type: Boolean}
];
var commandLineArgs = require('command-line-args');
var args = commandLineArgs(commandLineOptions);

var secrets = require('../secrets/secrets.json');
if(!args.nomail) {
    var recaptcha = require('node-recaptcha2').Recaptcha;
    var sendmail = require('sendmail')({
        silent: true,
        dkim: {
        privateKey: fs.readFileSync(path.resolve('secrets/mail.private'), 'utf8'),
        keySelector: 'carrievrtis.com'
        }
    });
}
var bodyParser = require('body-parser');

var cvProject = require('./cvProject.js');
var codeManifest = require('../static/media/code/manifest.json');
var designManifest = require('../static/media/design/manifest.json');
var photoManifest = require('../static/media/photo/manifest.json');
var writingManifest = require('../static/media/writing/manifest.json');

module.exports.makeRouter = function(langFile, langForce) {

    var router = express.Router();
    router.use(locale(langSupported, langDefault));

    var rootDir = (langForce ? '/' + langForce + '/' : '/');

    router.use(function(req, res, next) {
        if(langForce) {
            req.langData = langFile[langForce];
        }
        else {
            req.langData = langFile[req.locale];
        }
        next();
    });

    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true })); 
    
    router.get("/", function(req, res) {
        res.render(path.resolve('views/index'), { lang: req.langData, rootDir: rootDir, activePage: '', bg: '0' });
    });
    
    router.get("/about", function(req, res) {
        res.render(path.resolve('views/about'), { lang: req.langData, rootDir: rootDir, activePage: 'about', bg: '1' });
    });

    router.get("/contact", function(req, res) {
        var rc = new recaptcha(secrets.recaptcha.public, secrets.recaptcha.private);
        res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML() });
    });

    router.post("/contact", function(req, res) {

        var usrData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            company: req.body.company,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,
            sendCopy: req.body.sendCopy
        }

        var captchaData = {
            remoteip: req.connection.remoteAddress,
            response: req.body['g-recaptcha-response']
        };

        var rc = new recaptcha(secrets.recaptcha.public, secrets.recaptcha.private, captchaData);

        rc.verify(function(success, err) {
            if (success) {
                if(usrData.email) {
                    if(!args.nomail) {
                        var mailFirstName = (usrData.firstName ? usrData.firstName : '');
                        var mailLastName = (usrData.firstLast ? usrData.LastName : '');
                        var mailCompany = (usrData.company ? usrData.company : '');
                        var mailSubject = (usrData.subject ? usrData.subject : 'No Subject');
                        var mailMessage = (usrData.message ? usrData.message : 'No Message');
                        
                        let mailOptions = {
                            from: '"Carrie Vrtis" <noreply@carrievrtis.com>',
                            to: 'cjvrtis@gmail.com',
                            subject: mailSubject,
                            text: "CarrieVrtis.com Contact\n\nFrom: " + mailFirstName + " " + mailLastName + " < " + usrData.email + ">\n" + mailCompany + "\n\n" + mailSubject + '\n\n' + mailMessage,
                            html: '<p>CarrieVrtis.com Contact</p><hr /><p><b>From: ' + mailFirstName + ' ' + mailLastName + ' &lt;' + usrData.email + '&gt;</b></p><p>' + mailCompany + '</p><p>' + mailSubject + '</p><p>' + mailMessage + '</p>'
                        };

                        if(usrData.sendCopy) {
                            mailOptions.to = mailOptions.to + ', ' + usrData.email;
                        }
                        
                        sendmail(mailOptions, (error, info) => {
                            if (error) {
                                res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML(), response: 'fail', usrData: usrData });
                            }
                            else {
                                res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML(), response: 'confirm' });
                            }
                        });
                    }
                    else {
                        res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML(), response: 'fail', usrData: usrData });
                    }
                }
                else {
                    res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML(), response: 'email', usrData: usrData });
                }
            }
            else {
                res.render(path.resolve('views/contact'), { lang: req.langData, rootDir: rootDir, activePage: 'contact', bg: '6', rc: rc.toHTML(), response: 'captcha', usrData: usrData });
            }
        });
    });

    /* Multipurpose Error Handler */

    var sendError = function(req, res, err) {
        switch(err) {
            case 404:
                res.statusCode = 404;
                res.render(path.resolve('views/error/error'), { lang: req.langData, rootDir: rootDir, errorCode: res.statusCode.toString(), bg: '0' });
                break;
            default:
                res.statusCode = 500;
                res.render(path.resolve('views/error/error'), { lang: req.langData, rootDir: rootDir, errorCode: res.statusCode.toString(), bg: '0' });
                break;
        }
    }

    /* Project Routers */

    var codeRouter = cvProject.makeRouter('code', codeManifest, rootDir, '2', sendError);
    router.use('/code', codeRouter);

    var designRouter = cvProject.makeRouter('design', designManifest, rootDir, '3', sendError);
    router.use('/design', designRouter);

    var photoRouter = cvProject.makeRouter('photo', photoManifest, rootDir, '4', sendError);
    router.use('/photo', photoRouter);

    var writingRouter = cvProject.makeRouter('writing', writingManifest, rootDir, '5', sendError);
    router.use('/writing', writingRouter);

    /* Generic 404 */

    router.get('*', function(req, res) {
        sendError(req, res, 404);
    });

    return router;

};