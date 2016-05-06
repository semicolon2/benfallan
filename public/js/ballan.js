/**
 * Created by Ben on 4/18/2016.
 */
var ballan = angular.module('ballan', ['btford.socket-io', 'rzModule', 'color.picker']);

ballan.config(['$httpProvider', function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With, Content-Type'];
	$httpProvider.defaults.headers.common["Accept"] = "application/json";
	$httpProvider.defaults.headers.common["Content-Type"] = "application/json";
}]);

ballan.directive('drawingBoard', ['socket', 'loginFactory', 'drawingFactory', function (socket, loginFactory, drawingFactory) {
	return {
		scope: true,
		templateUrl: 'partials/drawing.html',
		link: function (scope) {
			var sketcher = atrament('#mySketcher', 700, 500);
			scope.sketcherColor = '#000000';
			scope.sketcherWeight = 3;

			scope.$watch('sketcherColor', function (newVal) {
				sketcher.color = newVal;
			});
			scope.$watch('sketcherWeight', function (newVal) {
				sketcher.weight = parseInt(newVal);
			});

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
			scope.erase = function () {
				sketcher.mode = 'erase';
				scope.drawMode = true;
			};
			scope.draw = function () {
				sketcher.mode = 'draw';
				scope.drawMode = false;
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

ballan.directive('loginPage', ['$http', function ($http) {
	return {
		scope: {},
		templateUrl: 'partials/login.html',
		link: function (scope) {
			
		}
	}
}]);

ballan.directive('characterSheet', ['charFactory', 'loginFactory', function(charFactory, loginFactory){
	return {
		scope: true,
		templateUrl: 'partials/characterSheet.html',
		link: function (scope) {
			loginFactory.userLevel().success(function (response) {
				if (response == 'admin') {
					charFactory.getChars().success(function (response) {
						scope.characterList = response;
					});
				} else {
					charFactory.getUserChars().success(function (response) {
						scope.characterList = response;
					});
				}
			});
			scope.newCharacter = {
				info: {
					'level': 1,
					'xp': 0,
					'name': '',
					'race': '',
					'class': '',
					'background': '',
					'alignment': '',
					'traits': '',
					'ideals': '',
					'bonds': '',
					'flaws': '',
					'backstory': '',
					'notes': '',
					'appearance': {
						'age': 0,
						'height': '',
						'weight': '',
						'eyes': '',
						'skin': '',
						'hair': ''
					}
				},
				stats: {
					'str': 0,
					'dex': 0,
					'con': 0,
					'int': 0,
					'wis': 0,
					'cha': 0,
					'proficiency': 2,
					'speed': 0,
					'inspiration': 0,
					'hp': 0,
					'hpMax': 0,
					'hpTemp': 0,
					'hitDie': 1,
					'hitDieType': '',
					'hitDieMax': 1,
					'saves': {
						'str': false,
						'dex': false,
						'con': false,
						'int': false,
						'wis': false,
						'cha': false
					},
					'skills': {
						'acrobatics': false,
						'animalHandling': false,
						'arcana': false,
						'athletics': false,
						'deception': false,
						'history': false,
						'insight': false,
						'intimidation': false,
						'investigation': false,
						'medicine': false,
						'nature': false,
						'perception': false,
						'performance': false,
						'persuasion': false,
						'religion': false,
						'sleightOfHand': false,
						'stealth': false,
						'survival': false
					}
				},
				feats: '',
				abilities: [],
				equipment: {
					'armour': [],
					'weapons': [],
					'other': [],
					'coin': {
						'pp': 0,
						'gp': 0,
						'sp': 0,
						'cp': 0
					}
				},
				spells: {
					'saveDC': Number,
					'mod': Number,
					'spellList': [String]
				},
					deathSaves: {'successes': 0, 'failures': 0}
			};
			scope.character = scope.newCharacter;

			scope.selectChar = function (charId) {
				if (charId == 0) {
					scope.character = scope.newCharacter;
				} else {
					charFactory.getChar(charId).success(function (response) {
						scope.character = response;
					});
				}
			};
			scope.checkSaveProf = function (ability) {
				if (scope.character.stats.saves[ability])
					return scope.character.stats.proficiency;
				else
					return 0;
			};
			scope.checkSkillProf = function (ability) {
				if (scope.character.stats.skills[ability])
					return scope.character.stats.proficiency;
				else
					return 0;
			};
			
			scope.abilityMod = function (ability) {
				switch(ability){
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
			scope.passivePerception = function () {
				return 10 + scope.abilityMod(scope.character.stats.wis) + scope.checkSkillProf('perception');
			};
			
			scope.newArmour = function () {
				scope.character.equipment.armour.push({'name': '', 'equipped': false, 'ac': 0, 'type': 'light', 'str': 0, 'desc': '', 'weight': 0});
			};
			scope.newWeapon = function () {
				scope.character.equipment.weapons.push({'name': '', 'equipped': false, 'proficiency': true, 'isRanged': false, 'range': '', 'dmg': '', 'dmgType': '', 'isVersatile': false, 'dmgVersatile': '', 'finesse': false, 'desc': '', 'weight': 0})
			};
			scope.newItem = function () {
				scope.character.equipment.other.push({'desc': '', 'weight': 0});
			};

			scope.newAbility = function () {
				scope.character.abilities.push({'name': '', 'desc': ''})
			};

			scope.equippedArmour = {'name': '', 'equipped': false, 'ac': 0, 'type': 'light', 'str': 0, 'desc': '', 'weight': 0};

			scope.armourEquip = function(pos, list){
				angular.forEach(list, function (armour, index) {
					if (pos != index)
						armour.equipped = false;
					if (pos == index)
						scope.equippedArmour = armour;
				});
			};

			scope.ac = function () {
				var ac = scope.equippedArmour.ac;
				if (scope.equippedArmour.type != 'heavy'){
					if (scope.equippedArmour.type != 'medium'){
						return ac + scope.abilityMod(scope.character.stats.dex);
					} else {
						return ac + Math.min(scope.abilityMod(scope.character.stats.dex), 2);
					}
				} else{
					return ac;
				}
			};

			scope.totalWeight = function () {
				var totalWeight = 0;
				angular.forEach(scope.character.equipment.armour, function (armour) {
					totalWeight = totalWeight + armour.weight;
				});
				angular.forEach(scope.character.equipment.weapons, function (weapon) {
					totalWeight = totalWeight + weapon.weight;
				});
				angular.forEach(scope.character.equipment.other, function (item) {
					totalWeight = totalWeight + item.weight;
				});
				return totalWeight;
			};

			scope.attacks = function (weapon) {
				var toHit;
				if (weapon.proficiency) {
					if (weapon.isRanged) {
					toHit = scope.abilityMod(scope.character.stats.dex) + scope.character.stats.proficiency;
					return 'To Hit: ' + toHit + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Range: ' + weapon.range;
					}
					else {
						if (weapon.finesse){
							if (weapon.isVersatile) {
								toHit = scope.abilityMod(scope.character.stats.dex) + scope.character.stats.proficiency;
								return 'To Hit: ' + toHit + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Versatile Dmg: ' + weapon.dmgVersatile;
							}else {
								toHit = scope.abilityMod(scope.character.stats.dex) + scope.character.stats.proficiency;
								return 'To Hit: ' + toHit + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType;
							}
						} else {
							if (weapon.isVersatile) {
								toHit = scope.abilityMod(scope.character.stats.str) + scope.character.stats.proficiency;
								return 'To Hit: ' + toHit + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Versatile Dmg: ' + weapon.dmgVersatile;
							}else {
								toHit = scope.abilityMod(scope.character.stats.str) + scope.character.stats.proficiency;
								return 'To Hit: ' + toHit + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType;
							}
						}
					}
				} else {
					if (weapon.isRanged) {
					return 'To Hit: ' + scope.abilityMod(scope.character.stats.dex) + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Range: ' + weapon.range;
					}
					else {
						if (weapon.finesse){
							if (weapon.isVersatile) {
								return 'To Hit: ' + scope.abilityMod(scope.character.stats.dex) + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Versatile Dmg: ' + weapon.dmgVersatile;
							}else {
								return 'To Hit: ' + scope.abilityMod(scope.character.stats.dex) + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType;
							}
						} else {
							if (weapon.isVersatile) {
								return 'To Hit: ' + scope.abilityMod(scope.character.stats.str) + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType + ' Versatile Dmg: ' + weapon.dmgVersatile;
							}else{
								return 'To Hit: ' + scope.abilityMod(scope.character.stats.str) + ' Damage: ' + weapon.dmg + ' ' + weapon.dmgType;
							}
						}
					}
				}

			};
			
			scope.updateChar = function(){
				charFactory.saveChar(scope.character);
			};
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