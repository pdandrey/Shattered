Shattered.Objects.Clair = me.ObjectEntity.extend({
 
	init: function(x, y, settings) {
		var sprite = Shattered.Game.Resources.sprites["Clair"];
		settings.image = "mainpcs";
		settings.spriteheight = sprite.height;
		settings.spritewidth = sprite.width;
		settings.collidable = true;
		
		this.parent(x, y, settings);

		this.portraitKey = "clair";
		
		this.setVelocity(3, 3);
		this.gravity = 0;

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
		Shattered.Game.PlayerEntity = this;
		
		if(!Shattered.Game.DialogController.isInDialog())
			Shattered.Game.Controller = this;
	},
 
	follow: function() { me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH); },
	
	onCollision : function (res) {
		console.log("collide");
	},
    
	update: function() {
		if(Shattered.Game.Controller != this)
			return;
			
		if(me.input.isKeyPressed('action')) {
			if(this.target && typeof(this.target.action) === 'function') {
				this.target.action(this);
			}
		}
 
		this.isStanding = true;
		
		if(me.input.isKeyPressed('run')) {
			this.setVelocity(6, 6);
		} else {
			this.setVelocity(3, 3);
		}
 
        if (me.input.isKeyPressed('left') && this.cancelMove != 'left') {
            this.vel.x -= this.accel.x * me.timer.tick;
			this.direction = 'left';
			this.isStanding = false;
        } else if (me.input.isKeyPressed('right') && this.cancelMove != 'right') {
            this.vel.x += this.accel.x * me.timer.tick;
			this.direction = 'right';
			this.isStanding = false;
        } else { this.vel.x = 0; }
		
		if(me.input.isKeyPressed('up') && this.cancelMove != 'up') {
			this.vel.y -= this.accel.y * me.timer.tick;
			this.direction = 'up';
			this.isStanding = false;
		} else if(me.input.isKeyPressed('down') && this.cancelMove != 'down') {
			this.vel.y += this.accel.y * me.timer.tick;
			this.direction = 'down';
			this.isStanding = false;
		} else {
            this.vel.y = 0;
        }
 
		if(this.isStanding)
			this.setCurrentAnimation("stand-" + this.direction);
		else {
			this.setCurrentAnimation(this.direction);
		}
 
        // check & update player movement
		try {
        	var env_res = this.updateMovement();
		} catch(err) {}
		
		var res = me.game.collide(this);
		if(res) {
			if(res.type == "partymember" || res.type == "npc") {
				this.target = res.obj;
			} else {
				this.target = null;
			}
			
			if (res.x != 0) {
				 // x axis
				 if (res.x<0) 
					this.cancelMove = 'left';
				 else
					this.cancelMove = 'right';
			  }
			  
			if(res.y != 0) {
			 // y axis
			 if (res.y<0)
				this.cancelMove = 'up';
			 else
				this.cancelMove = 'down';		
			  }
		} else {
			this.cancelMove = null;
			this.target = null;
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