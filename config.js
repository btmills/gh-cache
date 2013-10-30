var url = require('url');

var production = process.env.NODE_ENV === 'production'

var config = module.exports = {
	env: production,
	port: process.env.PORT || 5000,
	auth: process.env.AUTH,
	redis: process.env.REDISCLOUD_URL
		? url.parse(process.env.REDISCLOUD_URL)
		: {
			hostname: '127.0.0.1',
			port: 6379
		},
	github: {
		client_id: process.env.GITHUB_ID,
		client_secret: process.env.GITHUB_SECRET
	}
};
