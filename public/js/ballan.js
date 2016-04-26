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

ballan.directive('drawingBoard', ['socket', function (socket) {
	return {
		templateUrl: 'partials/drawing.html',
		link: function (scope) {
			var sketcher = atrament('#mySketcher');
			scope.send = function () {
				var dataURL = sketcher.toImage();
				socket.emit('sendDrawing', dataURL);
			};
			socket.on('sendDrawing', function (data) {
				scope.drawing = data;
			});
			scope.clear = function () {
				sketcher.clear();
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
			}, function (error) {
				console.log('error: ' + error);
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
	return loginFactory;
}]);