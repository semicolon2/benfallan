var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var googleStrategy = require('passport-google-oauth20').Strategy;

//=== env vars/ other vars ===
var port = process.env.PORT || 3000;
var googleClientId = process.env.GOOGLE_CLIENT_ID || '404489463501-2g87o9spt6inbprcdv7n62qqkf0qgceh.apps.googleusercontent.com';
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'xK7Eur_LYPEL7bEhlYTeT2jE';

//=== config stuff ===
app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE, OPTIONS');
  next();
});

//=== auth ===
passport.use(new googleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/return"
  }, function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get('/auth/google', passport.authenticate('google', {scope: ['profile'] }));

app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/'}),
    function (req, res) {
      res.redirect('/');

});

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb){
  cb(null, obj);
});

//=== routes ===
app.get('/', function (req, res) {
  res.render('index', {title: 'benfallan'});
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/draw', function (req, res) {
   res.render('draw');
});

//=== everything else? ===
io.on('connection', function (socket) {
  socket.on('sendDrawing', function (data) {
    socket.broadcast.emit('sendDrawing', data);
  });
});


http.listen(port);