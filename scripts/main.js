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
	},
	
	onload: function() {
		/*
		me.InvisibleEntity.prototype.oldInit = me.InvisibleEntity.prototype.init;
		me.InvisibleEntity.prototype.init = function(x, y, settings) {
			this.oldInit(x,y,settings);
			this.type = settings.type;
		}
		*/
		
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
		Shattered.Game.Resources = new Shattered.Resources();
		me.loader.preload(Shattered.Game.Resources.preload);

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
		me.levelDirector.loadLevel("Prologue-Augustun");
		
		me.game.sort();
	},

	onDestroyEvent: function() {
		me.game.disableHUD();
	}

});

window.onReady(function() {
	jsApp.onload();
});


/*
var PartyMember = me.ObjectEntity.extend({
	init: function(x,y,settings) {
		this.parent(x,y,settings);
		this.setVelocity(3, 3);
		this.gravity = 0;
		
		this.addAnimation("stand-up", [0]);
		this.addAnimation("stand-right", [3]);
		this.addAnimation("stand-down", [6]);
		this.addAnimation("stand-left", [9]);
		this.addAnimation("up", [0,1,2]);
		this.addAnimation("right", [3,4,5]);
		this.addAnimation("down", [6,7,8]);
		this.addAnimation("left", [9,10,11]);
		this.direction = 'down';
		
		this.dest = null;
	},
	
	onCollision : function (res) {
		//console.log("Party Collision at %d, %d", res.x, res.y);
	},
	
	action: function(src) {
		if(!me.game.HUD.isInDialog) 
			me.game.HUD.setItemValue("dialog", "I like swords");
		else
			me.game.HUD.setItemValue("dialog", null);
	},
	
	update: function() {
		var pc = me.game.getEntityByName("playerspawn")[0];
		
		if(!pc.isStanding) {
			this.setCurrentAnimation(this.direction);
		} else {
			this.setCurrentAnimation("stand-" + this.direction);
		}
		
		var xDiff = this.pos.x - pc.pos.x;
		var yDiff = this.pos.y - pc.pos.y;
		
		if(xDiff > 40)
			this.vel.x -= this.accel.x * me.timer.tick;
		else if(xDiff < -40)
			this.vel.x += this.accel.x * me.timer.tick;
		else
			this.vel.x = 0;
		
		if(yDiff > 40)
			this.vel.y -= this.accel.y * me.timer.tick;
		else if(yDiff < -40)
			this.vel.y += this.accel.y * me.timer.tick;
		else
			this.vel.y = 0;
		
		try {
			this.updateMovement();
		} catch(err) {}
		
		if (this.vel.x!=0 || this.vel.y!=0) {
            // update objet animation
            this.parent(this);
            return true;
        }
        return false;
	}
});

var Panner = me.InvisibleEntity.extend({
	init: function(x, y, settings) {
		// call the constructor
        this.parent(x, y, settings);
		//this.visible = false;
		//this.setVelocity(3,3);
		//this.gavity = 0;
		
        //me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
	},
	
	update: function() {
		//this.vel.x -= this.accel.x * me.timer.tick;
		//this.vel.y -= this.accel.y * me.timer.tick;
		//this.updateMovement();
		if(this.pos.x > 0)
			this.pos.x--;
		else if(this.pos.y > 0)
			this.pos.y--;
		else {
			me.game.remove(this);
			//me.game.getEntityByName("playerspawn")[0].follow();
		}
		this.parent(this);
		return true;
	}
});
*/

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