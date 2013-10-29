var express = require('express');
var redis = require('redis');
var url = require('url');
var config = require('./config');

var app = express();
app.use(express.logger());

var db = redis.createClient(config.redis.port, config.redis.hostname, { no_ready_check: true });
if (config.redis.auth) {
	db.auth(config.redis.auth.split(':')[1]);
}

app.get('/:key', function (req, res) {
	db.get(req.params.key, function (err, data) {
		res.send(data);
	});
});

app.get('/:key/:val', function (req, res) {
	db.set(req.params.key, req.params.val, function (err, data) {
		res.send(data);
	});
});

app.get('/' , function (req, res) {
	res.send('Hello world!');
});

app.listen(config.port, function () {
	console.log('Listening on port ' + config.port);
});
