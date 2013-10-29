var express = require('express');
var app = express();
app.use(express.logger());

app.get('/' , function (req, res) {
	res.send('Hello world!');
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log('Listening on port ' + port);
});