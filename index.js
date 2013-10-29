var express = require('express');
var GitHub = require('github');
var Redis = require('redis');
var config = require('./config');

var app = express();
app.use(express.logger());

var redis = Redis.createClient(config.redis.port, config.redis.hostname, { no_ready_check: true });
if (config.redis.auth) {
	redis.auth(config.redis.auth.split(':')[1]);
}

var gh = new GitHub({
	version: "3.0.0"
});
gh.authenticate({
	type: "basic",
	username: config.github.login,
	password: config.github.token
});

app.get('/' , function (req, res) {
	res.redirect('http://developer.github.com/');
});

app.get('/repos/:owner/:repo/contributors', function (req, res) {
	redis.get(req.path, function (err, data) {
		if (data) {
			res.send(JSON.parse(data));
		} else {
			gh.repos.getContributors({
				user: req.params.owner,
				repo: req.params.repo
			}, function (err, data) {
				if (err) return console.error(req.path, err);
				res.send(data);
				redis.set(req.path, JSON.stringify(data), function (err, status) {
					if (err || status !== 'OK') {
						return console.error(req.path, status, err);
					} else {
						console.log('Saved', req.path);
					}
				});
			});
		}
	});
});

app.get('/users/:user', function (req, res) {
	redis.get(req.path, function (err, data) {
		if (data) {
			res.send(JSON.parse(data));
		} else {
			gh.user.get({}, function (err, data) {
				if (err) return console.error(req.path, err);
				res.send(data);
				redis.set(req.path, JSON.stringify(data), function (err, status) {
					if (err || status !== 'OK') {
						return console.error(req.path, status, err);
					} else {
						console.log('Saved', req.path);
					}
				});
			});
		}
	});
});

app.listen(config.port, function () {
	console.log('Listening on port ' + config.port);
});
