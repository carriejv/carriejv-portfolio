'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');

var locale = require('locale');
var langSupported = ['en', 'es'];
var langDefault = 'en';

var dockerSecrets = require('docker-swarm-secrets').readSecretsSync();
var recaptcha = require('node-recaptcha2').Recaptcha;
var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');

var cvProject = require('./cvProject.js');
var codeManifest = require('../static/media/code/manifest.json');
var designManifest = require('../static/media/design/manifest.json');
var photoManifest = require('../static/media/photo/manifest.json');
var writingManifest = require('../static/media/writing/manifest.json');

module.exports.makeRouter = function(langFile, langForce) {

	var router = express.Router();
	router.use(locale(langSupported, langDefault));

	var rootDir = (langForce ? '/' + langForce + '/' : '/');

	router.use( (req, res, next) => {
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

	router.get("/", (req, res) => {
		res.render(path.resolve('views/index'), {
			lang: req.langData,
			rootDir: rootDir,
			activePage: '',
			bg: '0'
		});
	});

	router.get("/about", (req, res) => {
		res.render(path.resolve('views/about'), {
			lang: req.langData,
			rootDir: rootDir,
			activePage: 'about',
			bg: '1'
		});
	});

	router.get("/contact", (req, res) => {
		var rc = (dockerSecrets ? new recaptcha(dockerSecrets.recaptcha.public, dockerSecrets.recaptcha.private) : null);
		res.render(path.resolve('views/contact'), {
			lang: req.langData,
			rootDir: rootDir,
			activePage: 'contact',
			bg: '6',
			rc: (rc ? rc.toHTML() : null)
		});
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

		var rc = (parsedSecrets ? new recaptcha(parsedSecrets.recaptcha.public, parsedSecrets.recaptcha.private, captchaData) : null);

		var baseResponseData = {
			lang: req.langData,
			rootDir: rootDir,
			activePage: 'contact',
			bg: '6',
			rc: (rc ? rc.toHTML() : null),
			usrData: usrData
		};

		// This code is only used in dev environments in the abscence of secrets.
		if(!rc) {
			rc = {}
			rc.verify = function(cb) {
				if(typeof cb === 'function') {
					cb(true, false);
				}
			};
		}

		rc.verify( (success, err) => {
			if (success) {
				if(usrData.email) {
					var mailFirstName = (usrData.firstName ? usrData.firstName : '');
					var mailLastName = (usrData.lastName ? usrData.lastName : '');
					var mailCompany = (usrData.company ? usrData.company : '');
					var mailSubject = (usrData.subject ? usrData.subject : 'No Subject');
					var mailMessage = (usrData.message ? usrData.message : 'No Message');

					var mailOptions = {
						from: '"Carrie Vrtis" <noreply@carrievrtis.com>',
						to: 'cjvrtis@gmail.com',
						subject: mailSubject,
						text: "CarrieVrtis.com Contact\n\nFrom: " + mailFirstName + " " + mailLastName + " < " + usrData.email + ">\n" + mailCompany + "\n\n" + mailSubject + '\n\n' + mailMessage,
						html: '<p>CarrieVrtis.com Contact</p><hr /><p><b>From: ' + mailFirstName + ' ' + mailLastName + ' &lt;' + usrData.email + '&gt;</b></p><p>' + mailCompany + '</p><p>' + mailSubject + '</p><p>' + mailMessage + '</p>'
					};

					if(usrData.sendCopy) {
						mailOptions.to = mailOptions.to + ', ' + usrData.email;
					}
					if(dockerSecrets) {
						var transporter = nodemailer.createTransport({
							host: 'carrievrtis.com',
							port: 25,
							secure: false,
							auth: {
								user: dockerSecrets.email.user,
								pass: dockerSecrets.email.password
							},
						});

						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								var responseData = baseResponseData;
								responseData.response = 'fail';
								res.render(path.resolve('views/contact'), responseData);
							}
							else {
								var responseData = baseResponseData;
								responseData.response = 'confirm';
								res.render(path.resolve('views/contact'), responseData);
							}
						});

					}
					else {
						var responseData = baseResponseData;
						responseData.response = 'fail';
						res.render(path.resolve('views/contact'), responseData);
						//res.setHeader('Content-Type', 'application/json');
						//res.send(JSON.stringify(mailOptions));
					}
				}
				else {
					var responseData = baseResponseData;
					responseData.response = 'email';
					res.render(path.resolve('views/contact'), responseData);
				}
			}
			else {
				var responseData = baseResponseData;
				responseData.response = 'captcha';
				res.render(path.resolve('views/contact'), responseData);
			}
		});
	});

	/* Multipurpose Error Handler */

	var sendError = (req, res, err) => {
		switch(err) {
			case 404:
				res.statusCode = 404;
				res.render(path.resolve('views/error/error'), {
					lang: req.langData,
					rootDir: rootDir,
					errorCode: res.statusCode.toString(),
					bg: '0'
				});
				break;
			default:
				res.statusCode = 500;
				res.render(path.resolve('views/error/error'), {
					lang: req.langData,
					rootDir: rootDir,
					errorCode: res.statusCode.toString(),
					bg: '0'
				});
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

	router.get('*', (req, res) => {
		sendError(req, res, 404);
	});

	return router;

};