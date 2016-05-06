var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var googleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
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

//=== mongoose ===
var userSchema = mongoose.Schema({
    username: String,
	nickname: String,
	password: String,
    userLevel: String
});

userSchema.methods.validPassword = function(password){
	if (password == this.password)
		return true;
	else
		return false;
};
var User = mongoose.model('User', userSchema);

var drawingSchema = mongoose.Schema({
	name: String,
	url: String,
	createdAt: {type:Date, default: Date.now}
});
var Drawing = mongoose.model('Drawing', drawingSchema);

var characterSchema = mongoose.Schema({
    userId: String,
    info: {
		'level': {type: Number, default: 1},
		'xp': {type: Number, default: 0},
		'name': String,
		'race': String,
		'class': String,
		'background': String,
		'alignment': String,
		'traits': String,
		'ideals': String,
		'bonds': String,
		'flaws': String,
		'backstory': String,
		'notes': {type: String, default: ""},
		'appearance': {
			'age': Number,
			'height': String,
			'weight': String,
			'eyes': String,
			'skin': String,
			'hair': String
		}
	},
	stats: {
		'str': Number,
		'dex': Number,
		'con': Number,
		'int': Number,
		'wis': Number,
		'cha': Number,
		'proficiency': Number,
		'speed': Number,
		'inspiration': Number,
		'hp': Number,
		'hpMax': Number,
		'hpTemp': Number,
		'hitDie': {type: Number, default: 1},
		'hitDieType': String,
		'hitDieMax': {type: Number, default: 1},
		'saves': {
			'str': Boolean,
			'dex': Boolean,
			'con': Boolean,
			'int': Boolean,
			'wis': Boolean,
			'cha': Boolean
		},
		'skills': {
			'acrobatics': Boolean,
			'animalHandling': Boolean,
			'arcana': Boolean,
			'athletics': Boolean,
			'deception': Boolean,
			'history': Boolean,
			'insight': Boolean,
			'intimidation': Boolean,
			'investigation': Boolean,
			'medicine': Boolean,
			'nature': Boolean,
			'perception': Boolean,
			'performance': Boolean,
			'persuasion': Boolean,
			'religion': Boolean,
			'sleightOfHand': Boolean,
			'stealth': Boolean,
			'survival': Boolean
		},
		'passivePerception': Number
	},
	feats: String,
	abilities: [{'name': String, 'desc': String}],
	equipment: {
		'armour': [{'name': String, 'equipped': Boolean, 'ac': Number, 'type': String, 'str': Number, 'desc': String, 'weight': Number}],
		'weapons': [{'name': String, 'equipped': Boolean, 'proficiency': Boolean, 'isRanged': Boolean, 'range': String, 'dmg': String, 'dmgType': String, 'isVersatile': Boolean, 'dmgVersatile': String, 'finesse': Boolean, 'desc': String, 'weight': Number}],
		'other': [{'desc':String, 'weight': 0}],
		'coin': {
			'pp': Number,
			'gp': Number,
			'sp': Number,
			'cp': Number
		}
	},
	spells: {
		'saveDC': Number,
		'mod': Number,
		'spellList': [String]
	},
	deathSaves: {'successes': Number, 'failures': Number}
});
var Character = mongoose.model('Character', characterSchema);

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

//google auth
// passport.use(new googleStrategy({
//     clientID: googleClientId,
//     clientSecret: googleClientSecret,
//     callbackURL: "http://localhost:25565/auth/google/return"
//   }, function (token, refreshToken, profile, done) {
//     process.nextTick(function () {
//         User.findOne({'googleId': profile.id}, function (err, user) {
//             if (err){
//                return done(err);
//             }
//             if (user){
//                 return done(null, user);
//             }else {
//                 var newUser = new User();
//
// 				if (profile.displayName == 'Ben Allan')
// 					newUser.userLevel = 'admin';
// 				else
// 					newUser.userLevel = 'user';
//
//                 newUser.googleId = profile.id;
//                 newUser.token = token;
//                 newUser.name = profile.displayName;
//                 newUser.email = profile.emails[0].value;
//
//                 newUser.save(function (err) {
//                     if (err){
//                         throw err;
//                     }
//                     return done(null, newUser);
//                 });
//             }
//         });
//     });
//   }
// ));
// app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email'] }));
// app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/', successRedirect: '/draw'}));

//local auth
passport.use(new LocalStrategy(
	function (username, password, done) {
		User.findOne({username: username}, function (err, user) {
			if (err)
				return done(err);
			if (!user)
				return done(null, false, {message: 'Incorrect username'});
			if (!user.validPassword(password))
				return done(null, false, {message: 'Incorrect password'});
			return done(null, user);
		});
	}
));
app.post('/login/auth', passport.authenticate('local', {successRedirect: '/draw', failureRedirect: '/'}));

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

//character controllers
app.post('/char/save', isLoggedIn, function (req, res) {
	Character.findOne({'id': req.body.character.id}, function (err, character) {
		if (err){
			res.send(err);
			return;
		}
		if (character){
			Character.update(req.body.character.id, { $set: req.body.character}, {overwrite: true}, function (err, char) {
				if (err)
					res.send(err);
				else
					res.send('character updated!');
			});
		} else {
			var newCharacter = new Character(req.body.character);
			newCharacter.userId = req.user.id;
			newCharacter.save(function (err) {
				if (err)
					throw err;
				res.send('saved!');
			});
		}
	});
});

app.get('/char/get/:id', isLoggedIn, function (req, res){
	Character.findOne({_id: req.params.id}, function (err, character) {
		if (err){
			res.send(err);
			return;
		}
		if (character)
			res.send(character);
		else
			res.send('cannot find character');
	});
});
app.get('/char/getall/', isLoggedIn, isAdmin, function (req, res) {
	Character.find({}, {id: 1, info: 1}, function (err, characters){
		if (err){
			res.send(err);
			return;
		}
		if (characters)
			res.send(characters);
		else 
			res.send('no characters');
	});
});
app.get('/char/getuserchars/', isLoggedIn, function (req, res) {
	Character.find({'userId': req.user.id}, {id: 1, info: 1}, function (err, characters){
		if (err){
			res.send(err);
			return;
		}
		if (characters)
			res.send(characters);
		else 
			res.send('no characters');
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