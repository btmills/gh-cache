var url = require('url');
var express = require('express');
var Redis = require('redis');
var request = require('request');
var config = require('./config');

var app = express();
app.use(express.logger());

var redis = Redis.createClient(config.redis.port, config.redis.hostname, { no_ready_check: true });
if (config.redis.auth) {
	redis.auth(config.redis.auth.split(':')[1]);
}

app.get('/' , function (req, res) {
	res.redirect('http://developer.github.com/');
});

function cachify(path) {
	app.get(path, function (req, res) {
		redis.get(req.path, function (err, data) {
			if (data) {
				res.set('Content-Type', 'application/json');
				res.send(data);
			} else {
				request({
					uri: url.resolve('https://api.github.com', req.path),
					qs: {
						client_id: config.github.client_id,
						client_secret: config.github.client_secret
					}
				}, function (err, response, body) {
					if (err || response.statusCode !== 200) {
						res.send(500);
						console.error(err, response);
					} else {
						res.set('Content-Type', 'application/json');
						res.send(body);
						redis.set(req.path, body, function (err, status) {
							if (err || status !== 'OK') {
								console.error(req.path, status, err);
							} else {
								console.log('Saved', req.path);
							}
						});
					}
					console.log('Rate limit remaining', response.headers['x-ratelimit-remaining']);
				});
			}
		});
	});
}

cachify('/repos/:owner/:repo/contributors');
cachify('/users/:user');

app.listen(config.port, function () {
	console.log('Listening on port ' + config.port);
});
