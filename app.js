var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//=== config stuff ===
app.set('view engine', 'jade');
app.use(express.static('public'));

//=== env vars ===
var port = process.env.PORT || 3000;
var googleClientId = process.env.GOOGLE_CLIENT_ID || '404489463501-2g87o9spt6inbprcdv7n62qqkf0qgceh.apps.googleusercontent.com';
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'xK7Eur_LYPEL7bEhlYTeT2jE';

//=== routes ===
app.get('/', function (req, res) {
  res.render('index', {title: 'benfallan'});
});

//=== everything else? ===
io.on('connection', function (socket) {
  socket.on('sendDrawing', function (data) {
    socket.broadcast.emit('sendDrawing', data);
  });
});


http.listen(port);