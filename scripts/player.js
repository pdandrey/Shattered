"use strict";

Shattered.Objects.Clair = me.ObjectEntity.extend({
 
	init: function(x, y, settings) {
		var sprite = Shattered.Resources.sprites["Clair"];
		settings.image = sprite.key;
		settings.spriteheight = sprite.height;
		settings.spritewidth = sprite.width;
		settings.collidable = true;
		
		x -= sprite.collision.x;
		this.parent(x, y, settings);

		this.portraitKey = "clair";
		
		this.setVelocity(3, 3);
		this.gravity = 0;
		
		this.mob = Shattered.Party.Get("Clair");
		this.mob.entity = this;

		// set the display to follow our position on both axis
		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

		this.direction = "down";
		var arrDirections = Shattered.Enums.Directions.array;
		for(var i=0; i<arrDirections.length; ++i) {
			var key = arrDirections[i];
			this.addAnimation("stand-" + key, [sprite[key][0]]);
			this.addAnimation(key, sprite[key]);
		}

		this.setCurrentAnimation("stand-" + this.direction);
		
		if(sprite.collision)
			this.updateColRect(sprite.collision.x, sprite.collision.width, sprite.collision.y, sprite.collision.height);

		this.cancelMove = null;
		this.target = null;
		this.type = "player";
		this.jumping = false;
		
	},
 
	follow: function() { me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH); },
	
	onCollision : function (res) {
		//console.log("collide");
	},
    
	battleUpdate: function() {
		if(!this.mob)
			return false;
		
		if(Shattered.Battle.Current !== this.mob)
			return true;
		
		// Handle battle turn
		
		if(me.input.isKeyPressed('action')) {
			Shattered.Battle.Next();
			return true;
		}
		
		Shattered.Player.Move(this);
		
		return true;
	},
	
	update: function() {
		if((Shattered.Game.Control & Shattered.Enums.Control.Battle) === Shattered.Enums.Control.Battle) {
			if(this.battleUpdate()) {
				this.parent(this);
				return true;
			} else {
				return false;
			}
		}
	
		if((Shattered.Game.Control & Shattered.Enums.Control.Player) != Shattered.Enums.Control.Player)
			return;
			
		if(me.input.isKeyPressed('action')) {
			if(this.target && typeof(this.target.action) === 'function') {
				this.target.action(this);
			}
		}
 
		if(Shattered.Player.Move(this)) {
			this.parent(this);
			return true;
		}
		return false;
    }
 
});

Shattered.Player = {
	Move: function(player) {
		player.isStanding = true;
		
		var didMove = false;
		
		if(me.input.isKeyPressed('run')) {
			player.setVelocity(6, 6);
		} else {
			player.setVelocity(3, 3);
		}
 
        if (me.input.isKeyPressed('left') && player.cancelMove != 'left') {
            player.vel.x -= player.accel.x * me.timer.tick;
			player.direction = 'left';
			player.isStanding = false;
			didMove = true;
        } else if (me.input.isKeyPressed('right') && player.cancelMove != 'right') {
            player.vel.x += player.accel.x * me.timer.tick;
			player.direction = 'right';
			player.isStanding = false;
			didMove = true;
        } else { player.vel.x = 0; }
		
		if(me.input.isKeyPressed('up') && player.cancelMove != 'up') {
			player.vel.y -= player.accel.y * me.timer.tick;
			player.direction = 'up';
			player.isStanding = false;
			didMove = true;
		} else if(me.input.isKeyPressed('down') && player.cancelMove != 'down') {
			player.vel.y += player.accel.y * me.timer.tick;
			player.direction = 'down';
			player.isStanding = false;
			didMove = true;
		} else {
            player.vel.y = 0;
        }
 
		if(player.isStanding)
			player.setCurrentAnimation("stand-" + player.direction);
		else {
			player.setCurrentAnimation(player.direction);
		}
 
		var oldPos = player.pos.clone();
        // check & update player movement
        var env_res = player.updateMovement();
		
		if(!didMove)
			return false;
		
		if(player.mob.moveStart) {
			var box = player.collisionBox;
			var center = new me.Vector2d(box.left + box.width/2, box.top + box.height/2);
			var distance = player.mob.moveStart.distance(center);
			if(distance > player.mob.stats.Range * 32) {
				player.pos.setV(oldPos);
				player.vel.x = 0;
				player.vel.y = 0;
				return false;
			}
		}
		
		var res = me.game.collide(player);
		if(res) {
			if(res.type == "partymember" || res.type == "npc") {
				player.target = res.obj;
			} else if(res.type == "npc_link") {
				player.target = res.obj.getLink();
			} else {
				player.target = null;
				console.log("collide " + res.type);
			}
			
			if (res.x != 0) {
				 // x axis
				 if (res.x<0) 
					player.cancelMove = 'left';
				 else
					player.cancelMove = 'right';
			  }
			  
			if(res.y != 0) {
			 // y axis
			 if (res.y<0)
				player.cancelMove = 'up';
			 else
				player.cancelMove = 'down';		
			  }
		} else {
			player.cancelMove = null;
			player.target = null;
		}
 
        // update animation if necessary
        if (player.vel.x!=0 || player.vel.y!=0) {
				
            // update objet animation
            return true;
        }
        return false;
	}
}