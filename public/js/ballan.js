/**
 * Created by Ben on 4/18/2016.
 */
var ballan = angular.module('ballan', ['btford.socket-io']);

ballan.config(['$httpProvider', function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With, Content-Type'];
	$httpProvider.defaults.headers.common["Accept"] = "application/json";
	$httpProvider.defaults.headers.common["Content-Type"] = "application/json";
}]);

ballan.directive('drawingBoard', ['socket', 'loginFactory', 'drawingFactory', '$rootScope', function (socket, loginFactory, drawingFactory, $rootScope) {
	return {
		templateUrl: 'partials/drawing.html',
		link: function (scope) {
			var sketcher = atrament('#mySketcher');
			var dataURL = function () {
				return sketcher.toImage();
			};
			scope.send = function () {
				socket.emit('sendDrawing', dataURL());
			};
			socket.on('sendDrawing', function (data) {
				scope.drawing = data;
			});
			scope.clear = function () {
				sketcher.clear();
				socket.emit('sendDrawing', dataURL());
			};
			loginFactory.userLevel().success(function(response){
				if (response == 'admin')
					$rootScope.admin = true;
				else
					$rootScope.admin = false;
			});
			scope.save = function(){
				drawingFactory.saveDrawing(scope.saveAs, dataURL());
			}
		}
	}
}]);

ballan.directive('myHeader', ['loginFactory', function (loginFactory) {
	return {
		scope: {},
		templateUrl: 'partials/header.html',
		link: function (scope) {
			loginFactory.isLoggedIn().success(function (response) {
				scope.loggedIn = response;
			});
		}
	}
}]);

ballan.directive('characterSheet', ['charFactory', '$rootScope', function(charFactory, $rootScope){
	return {
		scope: {},
		templateUrl: 'partials/characterSheet.html',
		link: function (scope) {
			if ($rootScope.admin == true)
				scope.characterList = charFactory.getChars();
			else 
				scope.characterList = charFactory.getUserChars();

			scope.charId = 0;
			scope.character = charFactory.getChar(scope.charId);
			scope.character.info = {};
			scope.character.info.level = 11;

			
			scope.updateChar = function(){
				charFactory.saveChar(scope.character);
			};

			//calculate skill modifiers
			scope.character.equipment = {};
			scope.character.equipment.armour = [{'equipped': true, 'ac': 3, 'desc': "some test armour", 'weight': 5},{'equipped': false, 'ac': 5, 'desc': "some other armour", 'weight': 15}];
			scope.skillMod = function (skill) {
				switch(skill){
					case 1:
						return -5;
					case 2:
					case 3:
						return -4;
					case 4:
					case 5:
						return -3;
					case 6:
					case 7:
						return -2;
					case 8:
					case 9:
						return -1;
					case 10:
					case 11:
						return 0;
					case 12:
					case 13:
						return 1;
					case 14:
					case 15:
						return 2;
					case 16:
					case 17:
						return 3;
					case 18:
					case 19:
						return 4;
					case 20:
					case 21:
						return 5;
					case 22:
					case 23:
						return 6;
					case 24:
					case 25:
						return 7;
					case 26:
					case 27:
						return 8;
					case 28:
					case 29:
						return 9;
					case 30:
						return 10;
				}
			};

		}
	}
}]);

ballan.directive('newCharacterSheet', ['charFactory', function (charFactory) {
	return {
		scope: {},
		templateUrl: 'partials/newCharacterSheet.html',
		link: function (scope) {
			
		}
	}
}]);

ballan.factory('socket', ['socketFactory', function (socketfactory) {
	return socketfactory();
}]);

ballan.factory('loginFactory', ['$http', function ($http) {
	var loginFactory = {};
	loginFactory.isLoggedIn = function(){
		return $http.get('/auth/loggedin');
	};
	loginFactory.userLevel = function () {
		return $http.get('auth/userlevel');
	};
	return loginFactory;
}]);

ballan.factory('drawingFactory', ['$http', function ($http) {
	var drawingFactory = {};
	drawingFactory.saveDrawing = function (name, drawing) {
		return $http.post('/drawing/save', {name: name, drawing: drawing});
	};
	drawingFactory.getDrawing = function () {
		
	};
	return drawingFactory;
}]);

ballan.factory('charFactory', ['$http', function ($http) {
	var charFactory = {};
	charFactory.getChar = function(charId){
		return $http.get('/char/get/' + charId);
	};
	charFactory.getChars = function () {
		return $http.get('/char/getall/')
	};
	charFactory.getUserChars = function () {
		return $http.get('/char/getuserchars/');
	};
	charFactory.saveChar = function (char) {
		return $http.post('/char/save', {character: char});
	};
	return charFactory;
}]);