// Сервис по граббингу погоды с http://openweathermap.org/

var request = require('request');

module.exports = {

	cities: {
		524901: 'Москва',
		498817: 'Санкт-Петербург',
		520555: 'Нижний Новгород'
	},

	get: function (cityId, cb) {
		var data = {
			uri: 'http://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&lang=ru',
			headers: {
				'content-type' : 'application/json'
			}
		};

		request(data, function (error, response, body) {
			if (!error && response.statusCode == 200)
				return cb(null, body)
			else
				return cb(error, null)
		})
	},

	save: function (data) {

	}
}