// Сервис по граббингу погоды с http://openweathermap.org/

var request = require('request');
var redis = require("redis"), client = redis.createClient();

client.on("error", function (err) {
	console.log("Error " + err);
});

module.exports = {

	// id городов для API
	cities: {
		524901: 'Москва',
		498817: 'Санкт-Петербург',
		520555: 'Нижний Новгород'
	},

	// загрузка данных с сервиса
	load: function (cityId, cb) {
		var url = 'http://api.openweathermap.org/data/2.5/forecast/daily';
		var data = {
			// выбираем сразу на неделю, чтобы закешировать
			uri: url + '?id=' + cityId + '&lang=ru&cnt=7',
			headers: {
				'content-type' : 'application/json'
			}
		};

		var iam = this;
		request(data, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				// сохраняем результаты
				iam.save(cityId, JSON.stringify(data.list));
				// сразу же возвращаем ответ
				return cb(null, data.list)
			}
			else
				return cb(error, null)
		})
	},

	save: function (cityId, data) {
		// обнуляем список погоды для текущего города
		client.del('weather:' + cityId, redis.print);
		// добавляем погоду
		client.set('weather:' + cityId, data, redis.print);
		// устанавливаем время обновления
		client.set('city:' + cityId, new Date().getTime(), redis.print);
	},

	get: function (cityId, days, cb) {
		var now = new Date().getTime(), iam = this;
		client.get('city:' + cityId, function (e, updatedAt) {
			// если между прошлым временем сохранения и текущим временем прошло более 3х часов
			// то обновляем кеш
			if(now - updatedAt >= 3 * 3600000)
				iam.load(cityId, function (err, data) {
					return cb(null, data.slice(0, days));
				});
			// иначе просто берем с редиса
			else
				client.get('weather:' + cityId, function (err, data) {
					var list = JSON.parse(data);
					return cb(null, list.slice(0, days));
				})

		});
	}
}
