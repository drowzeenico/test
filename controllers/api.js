var weather = require('../services/weather.js');
var jade = require('jade');

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
			var options ={
				data: data, 
				view: req.query.view,
				layout: false
			};
			options.html = jade.renderFile('views/html.jade', options);
			res.render('script', options);
		})
	},

	test: function (req, res, next) {
		res.render('test', {
			layout: false,
			city: req.query.city, 
			view: req.query.view,
			days: req.query.days
		});
	}

}