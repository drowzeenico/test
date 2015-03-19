var weather = require('../services/weather.js');

module.exports = {

	index: function (req, res, next) {
		res.render('index', {cities : weather.cities});
	},

	generateCode: function (req, res, next) {
		weather.get(req.body.city, function (err, city) {
			if(err) res.json(err);

			console.log(city);
			res.render('code', req.body);
		});
	},

	getWeather: function (req, res, next) {

	}

}