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

ballan.directive('drawingBoard', ['socket', 'loginFactory', 'drawingFactory', function (socket, loginFactory, drawingFactory) {
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
					scope.admin = true;
				else
					scope.admin = false;
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

ballan.directive('characterSheet', [function(){
	return {
		scope: {},
		templateUrl: 'partials/characterSheet.html',
		link: function () {
			
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