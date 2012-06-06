var Shattered = {

	Enums: {
		Directions: (function() {
			var array = ['up','down','left','right'];
			var directions = {};
			for(var i=0; i<array.length; ++i) {
				directions[array[i]] = array[i];
			}
			
			Object.defineProperty(directions, "random", {
				get: function() { return ["up","down","left","right"][Number.random(0,3)]; }
			});
			Object.defineProperty(directions, "array", {
				get: function() { return array; }
			});
			
			return directions;
		})(),
		Episodes: {
			Prologue: "Prologue"
		},
		Gender: { Male: 1, Female: 2 },
		DialogOptions: { 
			MODE: { RANDOM: 1, SEQUENTIAL: 2 },
			Trigger: { Talk: 1, OnLoad: 2, Scripted: 3 }
		},
		Powers: {
			Target: { Any: 0, Self: 1, Party: 2, Enemy: 3 },
			Type: { Damage: 0, Healing: 1, Other: 0 },
			Level: { Basic: 0, Advanced: 1 },
			Range: { Weapon: -1 }
		},
		Items: {
			Type: { Weapon: 0, Armor: 1, Usable: 2, KeyItem: 3 },
			Slot: { Body: 'Body', Head: 'Head', Hands: 'Hands', Legs: 'Legs', Feet: 'Feet', Main: 'Main', OffHand: 'OffHand' }
		},
		Control: {
			Player: 1,
			Dialog: 2,
			Npc: 4
		}
	},

	Game: {
		Resources: null,
		Episode: "Prologue",
		Scene: 1,
		ExitTo: { x: 4, y: 42 },
		Control: null,
		Dialog: null
	},

	Settings: {
		width: 640,
		height: 480,
		doubleBuffer: false,
		scale: 1,
		tileSize: 32
	},
	
	Objects: {},
	
	Utility: {
		toXY: function(pos) {
			return { x: pos.x * Shattered.Settings.tileSize, y: pos.y * Shattered.Settings.tileSize };
		}
	}
};