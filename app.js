var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var googleStrategy = require('passport-google-oauth20').Strategy;
var assert = require('assert');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');


//=== env vars/ other vars ===
var port = process.env.PORT || 3000;
var googleClientId = process.env.GOOGLE_CLIENT_ID || '404489463501-2g87o9spt6inbprcdv7n62qqkf0qgceh.apps.googleusercontent.com';
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'xK7Eur_LYPEL7bEhlYTeT2jE';

//mongoose
var userSchema = mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    token: String,
    userLevel: String
});
var User = mongoose.model('User', userSchema);

var drawingSchema = mongoose.Schema({
	name: String,
	url: String,
	createdAt: {type:Date, default: Date.now}
});
var Drawing = mongoose.model('Drawing', drawingSchema);

mongoose.connect('mongodb://localhost:27017/benfallan');

//=== config stuff ===
app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'ak2udkeudh398rmdoaskeniclosaus23'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

//=== auth ===
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new googleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/return"
  }, function (token, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({'googleId': profile.id}, function (err, user) {
            if (err){
               return done(err);
            }
            if (user){
                return done(null, user);
            }else {
                var newUser = new User();

				if (profile.displayName == 'Ben Allan')
					newUser.userLevel = 'admin';
				else
					newUser.userLevel = 'user';

                newUser.googleId = profile.id;
                newUser.token = token;
                newUser.name = profile.displayName;
                newUser.email = profile.emails[0].value;

                newUser.save(function (err) {
                    if (err){
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    });
  }
));
app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email'] }));

app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/', successRedirect: '/draw'}));

app.get('/auth/loggedin', function (req, res) {
    var authenticated = req.isAuthenticated();
	process.nextTick(function () {
		res.send(authenticated);
	});
});

app.get('/auth/userlevel', function (req, res) {
	res.send(req.user.userLevel);
});

//=== routes ===
app.get('/', function (req, res) {
  res.render('index', {title: 'benfallan'});
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/draw', isLoggedIn, function (req, res) {
   res.render('draw');
});

app.post('/drawing/save', isLoggedIn, isAdmin, function (req, res) {
	Drawing.findOne({'name': req.body.name}, function (err, drawing) {
		if (err){
			res.send(err);
		}
		if (drawing)
			res.send('drawing with that name already exists');
		else {
			var newDrawing = new Drawing();

			newDrawing.url = req.body.drawing;
			newDrawing.name = req.body.name;

			newDrawing.save(function (err) {
				if (err)
					throw err;
				res.send('drawing saved!');
			});
		}
	});
});

//=== everything else? ===
io.on('connection', function (socket) {
  socket.on('sendDrawing', function (data) {
    socket.broadcast.emit('sendDrawing', data);
  });
});

//login and user level middleware
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/')
    }
}
function isAdmin(req, res, next) {
	if (req.user.userLevel == 'admin')
		return next();
	else{
		res.send('not admin');
		res.redirect(req.baseUrl);
	}
}


http.listen(port);