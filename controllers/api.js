var weather = require('../services/weather.js');

module.exports = {

	index: function (req, res, next) {
		res.render('index', {cities : weather.cities});
	},

	generateCode: function (req, res, next) {
		weather.load(req.body.city, function (err, data) {
			if(err) res.json(err);
			res.render('code', req.body);
		});
	},

	getWeather: function (req, res, next) {
		weather.get(req.query.city, req.query.days, function (err, data) {
			res.render('script', {
				data: data, 
				view: req.query.view,
				layout: false
			});
		})
	},

	test: function (req, res, next) {
		res.render('test', {layout: false});
	}

}