/**
 * Created by Ben on 4/18/2016.
 */
var ballan = angular.module('ballan', ['btford.socket-io']);

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

ballan.factory('socket', ['socketFactory', function (socketfactory) {
	return socketfactory();
}]);