Shattered.Objects.NPC = me.ObjectEntity.extend({
	
	init: function(x, y, settings) {
		
		switch(settings.name.toLowerCase()) {
			case 'doug':
				settings.sprite = Shattered.Game.Resources.sprites["Doug"];
				settings.portraitkey = settings.portraitkey || "doug";
				this.moveState = 0;
				break;
			
			case 'sheep':
				settings.spritekey = settings.spritekey || "sheep-random";
				settings.velocity = settings.velocity || 1;
				settings.delay = settings.delay || 500;
				break;
				
			default:
				settings.spritekey = settings.spritekey || "npc-male";
				settings.velocity = settings.velocity || 2;
				settings.delay = settings.delay || 300;
		}
		
		settings.pathkey = settings.pathkey || settings.name.toLowerCase();
		settings.type = settings.type || "npc";
		
		settings.sprite = settings.sprite || Shattered.Game.Resources.sprites[settings.spritekey];
		
		if(/-random$/.test(settings.spritekey) && Array.isArray(settings.sprite)) {
			var index = parseInt(Math.random() * 100) % settings.sprite.length;
			var key = settings.sprite[index];
			settings.sprite = Shattered.Game.Resources.sprites[key];
		}
		
		settings.image = settings.image || settings.sprite.key;
		
		settings.spritewidth = settings.spritewidth || settings.sprite.width;
		settings.spriteheight = settings.spriteheight || settings.sprite.height;
		
		if(typeof(settings.collidable) == "undefined")
			settings.collidable = true;
		
		settings.velocity = settings.velocity || 3;
		settings.delay = settings.delay || 100;
		
		this.parent(x,y,settings);
		this.setVelocity(settings.velocity, settings.velocity);
		
		this.ticksTillAction = 0;
		
		this.direction = "down";
		for(var key in {up:null, down:null, left:null, right:null}) {
			this.addAnimation("stand-" + key, [settings.sprite[key][0]]);
			this.addAnimation(key, settings.sprite[key]);
		}
		this.setCurrentAnimation("stand-" + this.direction);
		
		if(settings.sprite.collision)
			this.updateColRect(settings.sprite.collision.x, settings.sprite.collision.width, settings.sprite.collision.y, settings.sprite.collision.height);
		
		// dialog
		settings.dialogkey = settings.dialogkey || this.name;
		settings.dialogkey = settings.dialogkey.toLowerCase();
		this.dialog = null;
		if(settings.dialog)
			this.dialog = new Shattered.Objects.BasicDialog(Shattered.Enums.DialogOptions.MODE.SEQUENTIAL, settings.dialog);
		else if(settings.dialogkey) {
			if(Shattered.Game.Resources.dialog.Episodes[Shattered.Game.Episode]
				&& Shattered.Game.Resources.dialog.Episodes[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene])
				this.dialog = Shattered.Game.Resources.dialog.Episodes[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene][settings.dialogkey];
			if(!this.dialog)
				this.dialog = Shattered.Game.Resources.dialog.Global[settings.dialogkey];
		}
		
		this.settings = settings;
	},
	
	action: function(src) {
		var dialogController = Shattered.Game.Dialog;
		
		if(!dialogController) {
			return;
		}
			
		if(!dialogController.isInDialog()) {
			if(this.dialog) 
				dialogController.setText(this.dialog, this);
			else {
				dialogController.clear();
			}
		}
	},
	
	update: function() {
		
		if((Shattered.Game.Control & Shattered.Enums.Control.Npc) !== Shattered.Enums.Control.Npc)
			return;
		
		this.ticksTillAction = Math.max(0, this.ticksTillAction - 1);
		
		this.isStanding = true;
		
		var moved = false;
		
		if(!this.path) {
			// Is there a path for this Episode/Scene?
			if(Shattered.Pathing.Episodes[Shattered.Game.Episode] && Shattered.Pathing.Episodes[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene])
				this.path = Shattered.Pathing.Episodes[Shattered.Game.Episode]["Scene" + Shattered.Game.Scene][this.settings.pathkey];
			this.path = this.path || Shattered.Pathing.Global[this.settings.pathkey] || Shattered.Pathing.Global.random;
		}
		
		if(this.path)
			moved = this.path(this);
		
		if(this.isStanding)
			this.setCurrentAnimation("stand-" + this.direction);
		else {
			this.setCurrentAnimation(this.direction);
		}
		
		if(moved) {
			try {
				var env_res = this.updateMovement();
			} catch(err) {
				this.vel.x = 0;
				this.vel.y = 0;
				this.updateMovement();
				this.collide = true;
			}
		}
		
		// update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update objet animation
            this.parent(this);
            return true;
        }
        return false;
	}
});

Shattered.Pathing = {
	Global: {
		random: function(npc) {

			if(npc.ticksTillAction > 0)
				return false;
			
			if(!npc.start) {
				npc.direction = Shattered.Enums.Directions.random;
				npc.start = { x: npc.left, y: npc.top };
			} else {
				var diffX = Math.abs(npc.start.x - npc.left);
				var diffY = Math.abs(npc.start.y - npc.top);
				if(diffX > npc.width ||
					diffY > npc.height ||
					npc.collide) {
					npc.collide = false;
					npc.start = null;
					npc.ticksTillAction = Math.random() * npc.settings.delay;
					return false;
				}
			}
		
			switch(npc.direction) {
				case "left": 
					npc.vel.x -= npc.accel.x * me.timer.tick; 
					npc.vel.y = 0;
					break;
				case "right":
					npc.vel.x += npc.accel.x * me.timer.tick; 
					npc.vel.y = 0;
					break;
				case "up": 
					npc.vel.x = 0;
					npc.vel.y -= npc.accel.y * me.timer.tick; 
					break;
				case "down": 
					npc.vel.x = 0;
					npc.vel.y += npc.accel.y * me.timer.tick; 
					break;
			}
			npc.isStanding = false;
		
			return true;
		},
		
		none: function(npc) {
			return false;
		},
		
		movePath: function(npc, path) {
			if(!Array.isArray(path))
				throw "path is not an array";
			
			if(!npc.pathIndex)
				npc.pathIndex = 0;
				
			if(npc.pathIndex >= path.length) {
				npc.vel.x = 0;
				npc.vel.y = 0;
				return false;
			}
			
			var x = path[npc.pathIndex].x || npc.x;
			var y = path[npc.pathIndex].y || npc.y;
			
			if(x > npc.right) {
				npc.direction = 'right';
				npc.vel.x += npc.accel.x * me.timer.tick;
				npc.vel.y = 0;
			} else if(x < npc.left) {
				npc.direction = 'left';
				npc.vel.x -= npc.accel.x * me.timer.tick;
				npc.vel.y = 0;
			} else if(y < npc.top) {
				npc.direction = 'up';
				npc.vel.x = 0;
				npc.vel.y -= npc.accel.y * me.timer.tick;
			} else if(y > npc.bottom) {
				npc.direction = 'down';
				npc.vel.x = 0;
				npc.vel.y += npc.accel.y * me.timer.tick;
			} else {
				npc.vel.x = 0;
				npc.vel.y = 0;
				npc.direction = 'down';
				npc.pathIndex++;
				npc.isStanding = true;
				return false;
			}
			npc.isStanding = false;
			return true;
		}
	},
	
	Episodes: {
		Prologue: {
			Scene1: {
				fountainChild: function(npc) {
					var path = [
						{ x: null, y: (61 * 32) },
						{ x: 35 * 32, y: null },
						{ x: null, y: 53 * 32 },
						{ x: 29 * 32, y: null }
					];
					
					if(!Shattered.Pathing.Global.movePath(npc, path)) {
						if(npc.pathIndex >= path.length)
							npc.pathIndex = 0;
						return false;
					} else {
						return true;
					}
				}
			}
		}
	}
	
};