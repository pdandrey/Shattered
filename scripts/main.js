"use strict";

var v = null;
var invis = null;

var doug;
var tt;

var jsApp	= 
{	levelLoaded: function(levelId) {
		Shattered.Story.onLevelLoaded(levelId);
		
		if(me.game.getEntityByName("dialogcontroller").length == 0) {
			me.game.add(Shattered.Game.Dialog);
		}
		if(me.game.getEntityByName("clair").length == 0 && Shattered.Game.ExitTo) {
			var pos = Shattered.Utility.toXY(Shattered.Game.ExitTo);
			var clair = new Shattered.Objects.Clair(pos.x, pos.y, { name: "clair"});
			var z = 7;
			me.game.add(clair, z);
			Shattered.Game.ExitTo = null;
			me.game.sort();
		}
		
		v = me.Vector2d.toXY(11, 36);
		invis = new me.InvisibleEntity(v.x, v.y, { name: 'me.InvisibleEntity', collidable: true });
		v = invis.pos;
		invis.updateColRect(0, 32, 0, 32);
		me.game.addEntity(invis, me.game.currentLevel.objectGroups[0].z);
		me.game.sort();
		
		doug = me.game.getEntityByName("doug")[0];
		tt = new Shattered.Objects.TileTester(0, 0, { });
		me.game.add(tt, me.game.currentLevel.objectGroups[0].z);
	},
	
	onload: function() {
		/*
		me.InvisibleEntity.prototype.oldInit = me.InvisibleEntity.prototype.init;
		me.InvisibleEntity.prototype.init = function(x, y, settings) {
			this.oldInit(x,y,settings);
			this.type = settings.type;
		}
		*/
		
		me.Vector2d.toTile = function(x, y) {
			return new me.Vector2d(x / Shattered.Settings.tileSize, y / Shattered.Settings.tileSize);
		}
		
		me.Vector2d.toXY = function(x, y) {
			return new me.Vector2d(x * Shattered.Settings.tileSize, y * Shattered.Settings.tileSize);
		}
		
		me.Vector2d.prototype.toTile = function() {
			return new me.Vector2d(this.x / Shattered.Settings.tileSize, this.y / Shattered.Settings.tileSize);
		};
		me.Vector2d.prototype.toXY = function() {
			return new me.Vector2d(this.x * Shattered.Settings.tileSize, this.y * Shattered.Settings.tileSize);
		};
		
		me.Vector2d.prototype.fromTile = function(tileVector) {
			this.setV(tileVector.toXY());
		};
		
		me.game.sortFunction = function(a, b) {
			var az = a.z;
			var bz = b.z
			if(a.type == "npc" || a.type=="player")
				az = a.z + (a.pos.y / 32 / 1000);
			if(b.type == "npc" || b.type=="player")
				bz = b.z + (b.pos.y / 32 / 1000);
			return (bz - az);
		};
		
		me.LevelEntity.prototype.oldInit = me.LevelEntity.prototype.init;
		me.LevelEntity.prototype.init = function(x, y, settings) {
			this.oldInit(x, y, settings);
			this.type = settings.type || "zone";
			
			if(settings.exitto) {
				var pos = settings.exitto.split(",");
				this.exitto = { x: parseFloat(pos[0]), y: parseFloat(pos[1]) };
			}
			if(settings.remember) {
				this.remember = true;
			}
		}
		
		me.LevelEntity.prototype.oldGoTo = me.LevelEntity.prototype.goTo;
		me.LevelEntity.prototype.goTo = function(level) {
			if(this.exitto) {
				Shattered.Game.ExitTo = this.exitto;
			}
			if(!level && !this.nextlevel && Shattered.Game.ReturnTo) {
				level = Shattered.Game.ReturnTo;
				Shattered.Game.ReturnTo = null;
			}
			if(this.remember) {
				Shattered.Game.ReturnTo = me.levelDirector.getCurrentLevelId();
			}
			this.oldGoTo(level);
		}
		
		if (!me.video.init('jsapp', Shattered.Settings.width, Shattered.Settings.height, Shattered.Settings.doubleBuffer, Shattered.Settings.scale))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}
		
		// initialize the "audio"
		me.audio.init("mp3,ogg");
		
		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);
		me.game.onLevelLoaded = this.levelLoaded.bind(this);
		
		// set all resources to be loaded
		me.loader.preload(Shattered.Resources.preload);

		me.debug.renderHitBox = true;
		me.sys.gravity = 0;
		
		Shattered.Game.Dialog = new Shattered.Objects.DialogBox(0,0,100);
		
		// me.levelDirector.onLevelLoaded = function() {
			// me.game.add(Shattered.Game.Dialog, Shattered.Game.Dialog);
		// }
		
		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
	},
	
	loaded: function() {
		var ps = new Shattered.Objects.PlayScreen();
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, ps);
		 
		// add our player entity in the entity pool
		me.entityPool.add("clair", Shattered.Objects.Clair);
		me.entityPool.add("doug", Shattered.Objects.NPC);
		me.entityPool.add("sheep", Shattered.Objects.NPC);
		me.entityPool.add("npc", Shattered.Objects.NPC);
		me.entityPool.add("npc_link", Shattered.Objects.NPC_Link);
		me.entityPool.add("chest", Shattered.Objects.Chest);
		me.entityPool.add("tiletester", Shattered.Objects.TileTester);

		// enable the keyboard
		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP, "up");
		me.input.bindKey(me.input.KEY.DOWN, "down");
		me.input.bindKey(me.input.KEY.A, "action", true);
		me.input.bindKey(me.input.KEY.SHIFT, "run");
		
		// start the game
		me.state.change(me.state.PLAY);
	}

}; // jsApp

Shattered.Objects.PlayScreen = me.ScreenObject.extend({

	onResetEvent: function() {	
		//me.levelDirector.loadLevel("augustun-armorshop");
		me.game.addHUD(0, 0, Shattered.Settings.width, Shattered.Settings.height);
		
		me.game.add(Shattered.Game.Dialog, Shattered.Game.Dialog.z);
		
		me.game.HUD.addItem("dialog", Shattered.Game.Dialog.getHUD());
		me.levelDirector.loadLevel("prologue-battle");
		
		me.game.sort();
	},

	onDestroyEvent: function() {
		me.game.disableHUD();
	}

});

window.onReady(function() {
	Number.random = Number.prototype.random;
	jsApp.onload();
});

CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	this.beginPath();
	this.moveTo(x + radius, y);
	this.lineTo(x + width - radius, y);
	this.quadraticCurveTo(x + width, y, x + width, y + radius);
	this.lineTo(x + width, y + height - radius);
	this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	this.lineTo(x + radius, y + height);
	this.quadraticCurveTo(x, y + height, x, y + height - radius);
	this.lineTo(x, y + radius);
	this.quadraticCurveTo(x, y, x + radius, y);
	this.closePath();
	if (stroke) {
		this.stroke();
	}
	if (fill) {
		this.fill();
	}       
}