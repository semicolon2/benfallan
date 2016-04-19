/**
 * Created by Ben on 4/18/2016.
 */
var ballan = angular.module('ballan', ['btford.socket-io']);

ballan.config(['$httpProvider', function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['x-Requested-With'];
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
			}
			socket.on('sendDrawing', function (data) {
				scope.drawing = data;
			});
		}
	}
}]);

ballan.directive('myHeader', [function () {
	return {
		templateUrl: 'partials/header.html'
	}
}]);

ballan.directive('loginPage', ['$http', function ($http) {
	return {
		templateUrl: 'partials/login.html',
		link: function (scope) {
			scope.login = function () {
				$http.get('/auth/google');
			}
		}
	}
}]);

ballan.factory('socket', ['socketFactory', function (socketfactory) {
	return socketfactory();
}]);