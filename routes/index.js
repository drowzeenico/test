var express = require('express');
var router = express.Router();

var API = require('../controllers/api.js');

router.get('/', function(req, res, next) {
	API.index(req, res, next)
});

router.post('/generate', function(req, res, next) {
	API.generateCode(req, res, next)
});

router.get('/weather', function(req, res, next) {
	API.getWeather(req, res, next)
});

module.exports = router;
