// game resources

Shattered.Resources = (function() {

	return Object.extend({
		init: function(episode) {
			if(episode == null)
				episode = Shattered.Game.Episode;
			
			Object.defineProperty(this, "episode", {writable:false, value: episode});
			Object.defineProperty(this, "preload", {get: getPreloadResources});
			Object.defineProperty(this, "sprites", {get: getSprites});
			Object.defineProperty(this, "dialog", {get: getDialog});
			Object.defineProperty(this, "souls", {get: getSouls});
			Object.defineProperty(this, "portraits", { get: getPortraits });
		}
	});

	var preload = null;
	var sprites = null;
	var dialog = null;
	var souls = null;
	var soulSets = null;
	var portraits = null;
	
	function getPreloadResources() {
		var episode = this.episode;
	
		if(preload != null)
			return preload;
		
		return [
			image("GrasslandV6_0_3", "GrasslandV6_0_3.png"),
			image("treesv6_0", "treesv6_0.png"),
			image("browserquest", "browserquest.png"),
			image("beach_sand_woa3_0", "beach_sand_woa3_0.png"),
			image("Houses", "Houses.png"),
			image("metatiles32x32", "metatiles32x32.png"),
			map("Prologue-Augustun", "Augustun-Prologue.tmx"),
			map("augustun-armorshop", "Augustun-ArmorShop.tmx"),
			map("augustun-weaponshop", "Augustun-WeaponShop.tmx"),
			map("augustun-inn", "Augustun-Inn.tmx"),
			sprite("clair", "clair.png"),
			sprite("doug", "doug.png"),
			sprite("mainpcs", "MainPCs.png"),
			sprite("sheep", "sheep.png"),
			sprite("npc_f1", "student_a.png"),
			sprite("npc_f2", "student_b.png"),
			sprite("npc_m", "student_c.png"),
			sprite("npc_standing", "characters_accessorized.png"),
			sprite("24x32_Character_Template_C1_CharlesGabriel-1", "24x32_Character_Template_C1_CharlesGabriel-1.png"),
			portrait("48x48_Faces_1st_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_2nd_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_3rd_Sheet_Update_CharlesGabriel_OGA_0"),
			portrait("48x48_Faces_4th_Sheet_Update_CharlesGabriel_OGA_0")
		];
		
		function image(name, filename) {
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
		
		buildSprite('Clair', "clair", 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('Doug', "doug", 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('sheep-black-red', "sheep", 48, 64, 0,12,24,36,3);
		buildSprite('sheep-gold', "sheep", 48, 64, 3,15,27,39,3);
		buildSprite('sheep-black-gold', "sheep", 48, 64, 6,18,30,42,3);
		buildSprite('sheep-ghost', "sheep", 48, 64, 9,21,33,45, 3);
		buildSprite('sheep-white-gold', "sheep", 48, 64, 48, 60, 72, 84, 3);
		buildSprite('sheep-tan', "sheep", 48, 64, 51, 63, 75, 87, 3);
		buildSprite('sheep-white-black', "sheep", 48, 64, 54, 66, 78, 90, 3, collision(8, 30, 32, 32));
		buildSprite('sheep-pink', "sheep", 48, 64, 57, 69, 81, 93, 3);
		buildSprite('npc-male', 'npc_m', 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('npc-female', 'npc_f2', 64, 64, 0, 27,18,9,9, collision(16, 32, 32, 32));
		buildSprite('npc-child-male', '24x32_Character_Template_C1_CharlesGabriel-1', 48, 64, 6, 18, 30, 42, 3);
		buildSprite('npc-child-female', '24x32_Character_Template_C1_CharlesGabriel-1', 48, 64, 9, 21, 33, 45, 3);
		
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
	
	function getSouls() {
		if(souls != null)
			return souls;
		
		souls = [];
		
		souls.push(new Shattered.Objects.Soul("Warrior", new Shattered.Objects.Stats(.25, .2, 0,0,0,0,.05), []));
		souls.push(new Shattered.Objects.Soul("Engineer", new Shattered.Objects.Stats(0,.25,0,.3,.1,0,.03), []));
		souls.push(new Shattered.Objects.Soul("Mage", new Shattered.Objects.Stats(0,0,0,.4,.2,.1,0), []));
		souls.push(new Shattered.Objects.Soul("Thief", new Shattered.Objects.Stats(.05, 0, .3, 0,0,0,.03), []));
		
		return souls;
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