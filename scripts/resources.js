"use strict";

// game resources

Shattered.Resources = (function() {

	var ret = {};
	Object.defineProperty(ret, "preload", { get: getPreloadResources });
	Object.defineProperty(ret, "sprites", { get: getSprites });
	Object.defineProperty(ret, "dialog", { get: getDialog });
	Object.defineProperty(ret, "portraits", { get: getPortraits });
	return ret;
	
	var sprites = null;
	var dialog = null;
	var portraits = null;
	
	function getPreloadResources() {
		
		return [
			image("ground"),
			image("doodads"),
			image("trees"),
			image("house"),
			image("bridges"),
			image("fishplants6"),
			image("market3"),
			image("market1"),
			image("metatiles32x32"),
			image("plants"),
			image("inside", "inside.png"),
			image("indoor_doodads", "indoor_doodads.png"),
			map("Prologue-Augustun", "Augustun-Prologue2.tmx"),
			map("augustun-armorshop", "Augustun-ArmorShop.tmx"),
			map("augustun-weaponshop", "Augustun-WeaponShop.tmx"),
			map("augustun-inn", "Augustun-Inn.tmx"),
			map("prologue-battle", "Prologue-Battle.tmx"),
			sprite("clair", "clair.png"),
			sprite("doug", "male_archer.png"),
			sprite("mainpcs", "MainPCs.png"),
			sprite("sheep", "sheep.png"),
			sprite("npc_f1", "student_a.png"),
			sprite("npc_f2", "student_b.png"),
			sprite("npc_m", "student_c.png"),
			sprite("npc_standing", "characters_accessorized.png"),
			sprite("snake", "snake.png"),
			sprite("24x32_Character_Template_C1_CharlesGabriel-1", "24x32_Character_Template_C1_CharlesGabriel-1.png"),
			portrait("48x48_Faces_1st_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_2nd_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_3rd_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_4th_Sheet_Update_CharlesGabriel_OGA_0")
		];
		
		function image(name, filename) {
			filename = filename || name + ".png";
			return { name: name, type: "image", src: "images/" + filename };
		}

		function map(name, filename) {
			return { name: name, type: "tmx", src: "maps/" + filename };
		}
		
		function sprite(name, filename) {
			return { name: name, type: "image", src: "sprites/" + filename };
		}
		
		function portrait(name) {
			return { name: name, type: "image", src: "portraits/" + name + ".png" };
		}
	}
	
	function getSprites() {
		var episode = this.episode;
	
		if(sprites != null)
			return sprites;
			
		sprites = [];
		
		buildSprite('Clair', "clair", 64, 64, 0, 27,18,9,8, collision(18, 32, 28, 28));
		buildSprite('Doug', "doug", 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('sheep-black-red', "sheep", 48, 64, 0,12,24,36,3, collision(8, 30, 32, 32));
		buildSprite('sheep-gold', "sheep", 48, 64, 3,15,27,39,3, collision(8, 30, 32, 32));
		buildSprite('sheep-black-gold', "sheep", 48, 64, 6,18,30,42,3, collision(8, 30, 32, 32));
		buildSprite('sheep-ghost', "sheep", 48, 64, 9,21,33,45, 3, collision(8, 30, 32, 32));
		buildSprite('sheep-white-gold', "sheep", 48, 64, 48, 60, 72, 84, 3, collision(8, 30, 32, 32));
		buildSprite('sheep-tan', "sheep", 48, 64, 51, 63, 75, 87, 3, collision(8, 30, 32, 32));
		buildSprite('sheep-white-black', "sheep", 48, 64, 54, 66, 78, 90, 3, collision(8, 30, 32, 32));
		buildSprite('sheep-pink', "sheep", 48, 64, 57, 69, 81, 93, 3, collision(8, 30, 32, 32));
		buildSprite('npc-male', 'npc_m', 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('npc-female', 'npc_f2', 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('npc-child-male', '24x32_Character_Template_C1_CharlesGabriel-1', 48, 64, 6, 18, 30, 42, 3, collision(12,32,24,32));
		buildSprite('npc-child-female', '24x32_Character_Template_C1_CharlesGabriel-1', 48, 64, 9, 21, 33, 45, 3, collision(12,32,24,32));
		buildSprite("snake", 'snake', 32, 32, 0, 9, 6, 3, 3);
		sprites["sheep-random"] = [
			"sheep-gold", "sheep-black-red", "sheep-black-gold",
			'sheep-ghost', 'sheep-white-gold', 'sheep-tan',
			'sheep-white-black', 'sheep-pink'
		];
		
		return sprites;
		
		function buildSprite(name, imageName, width, height, up, right, down, left, count, collision) {
			var tmp = {
				up: [up],
				right: [right],
				down: [down],
				left: [left],
				width: width,
				height: height,
				collision: collision,
				key: imageName
			};
			for(var i=1; i<count; ++i) {
				tmp.up.push(up + i);
				tmp.down.push(down + i);
				tmp.left.push(left + i);
				tmp.right.push(right + i);
			}
			sprites[name] = tmp;
		}
		
		function collision(x, y, w, h) {
			return { x: x, y: y, width: w, height: h };
		}
	}

	function getDialog() {
		if(dialog != null)
			return dialog;
			
		dialog = {
			Global: {
				sheep: new Shattered.Objects.BasicDialog(Shattered.Enums.DialogOptions.MODE.RANDOM, ["Baaa...", "Baaa....", "Baaa...Ram....Yew..."]),
				npc: new Shattered.Objects.BasicDialog(Shattered.Enums.DialogOptions.MODE.RANDOM, "I like swords.\nWelcome to Augustun. 1234567890 ABCDEFGHIJKLMN OPQRSTUVWXYZ\nline 4\nline 5\nline 6\nline 7")
			},
			
			Episodes: {
				Prologue: {
					Scene1: {
					}
				}
			}
		}
		return dialog;
	}
		
	function getPortraits() {
		if(portraits != null)
			return portraits;
		
		portraits = [];
		
		portrait("clair", "48x48_Faces_2nd_Sheet_Update_CharlesGabriel_OGA_0", 6*5+3);
		portrait("doug", "48x48_Faces_1st_Sheet_Update_CharlesGabriel_OGA_0", 6*4+4);
		portrait("shepard", "48x48_Faces_3rd_Sheet_Update_CharlesGabriel_OGA_0", 6*4+2);
		
		return portraits;
		
		function portrait(name, resource, index) {
			portraits[name] = {
				name: name,
				resource: resource,
				index: index
			};
		}
	}
})();