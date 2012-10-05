/*
 * Neverwell Moor, a fantasy action RPG
 * Copyright (C) 2012  Jason Oster
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* NPCs */
Shattered.Objects.Entities.Mob = Shattered.Objects.Sprite.extend({
    // Bounding Box where this NPC can see.
    vision: null,

    // NPC will move toward this vector.
    destination: null,

    // Direction facing.
    direction: Shattered.Enums.Directions.South,

    // Re-render when true.
    isDirty: false,

    // Standing or walking?
    standing: true,

    // Sleep time when standing.
    sleep: 0,

    // Maximum distance to walk while roaming.
    maxDistance: 200,

    // How much force to apply when walking.
    forceConstant: 600,

    // How far away from destination is "good enough".
    // A low tolerance will cause the NPC to "bounce" around its destination.
    // A high tolerance will cause the NPC to stop short of its destination.
    // This tolerance will cause just enough "bounciness" to look "realistic".
    destTolerance: 8,

    // Walking speed. (forceConstant is multiplied by velocity for the final force applied.)
    velocity: 2,

    // A helper constant.
    walk_angle: Math.sin((45).degToRad()),

    playerControlled: false,

    /**
     *
     * @param {int} x
     * @param {int} y
     * @param {me.ObjectSettings} settings
     */
    init: function(x, y, settings) {

        var self = this;

        var sheet = Shattered.Resources.getSpriteSheet(settings.image);
        settings.spriteheight = sheet.height;
        settings.spritewidth = sheet.width;
        this.sheet = sheet;

        if("charactername" in settings)
            this.name = settings.charactername.toLowerCase();
        else
            this.name = "Mob [" + settings.image + "]";

        settings.shape = {
            "type"      : "circle",
            "radius"    : 10,
            "offset"    : cp.v(0, -15)
        };

        self.parent(x, y, settings);

        this.isEntity = true;

        // Set animations.
        sheet.apply(this);
        this.currentAction = null;
        this.stand();

        // AI initialization.
        self.destination = cp.v(0, 0);

        var shape = self.body.shapeList[0];
        self.vision = cp.bb(shape.bb_l, shape.bb_b, shape.bb_r, shape.bb_t);

        if("player" in settings) {
            this.playerControlled = settings.player;
        }

        if(this.playerControlled) {
            this.setPlayerControlled();
        } else {
            this.setAIControlled();
        }
    },

    setPlayerControlled: function() {
        if(Shattered.Status.PlayerMob)
            Shattered.Status.PlayerMob.setAIControlled();

        Shattered.Status.PlayerMob = this;
        this.playerControlled = true;
        this.destination = cp.v(0,0);
        this.body.resetForces();

        this.body.eachShape(function eachShape(shape) {
            shape.collision_type = Shattered.Chipmunk.Collision.Player;
            shape.setLayers(Shattered.Chipmunk.Layers.Player
                | Shattered.Chipmunk.Layers.Exit
                | Shattered.Chipmunk.Layers.Mob
                | Shattered.Chipmunk.Layers.Walls
            );
        });

        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },

    setAIControlled: function() {
        if(Shattered.Status.PlayerMob === this)
            Shattered.Status.PlayerMob = null;
        this.playerControlled = false;
        this.body.resetForces();

        var self = this;
        self.body.eachShape(function eachShape(shape) {
            shape.collision_type = Shattered.Chipmunk.Collision.Friend;
            shape.setLayers(Shattered.Chipmunk.Layers.Mob
                | Shattered.Chipmunk.Layers.Player
                | Shattered.Chipmunk.Layers.Interactive
                | Shattered.Chipmunk.Layers.Walls
            );
            shape.data.power = self.power;
        });
    },

    resetRoam: function() {
        if (this.sleep <= 0) {
            // Sleep for a random period between 0 - 5 seconds.
            this.sleep = Math.random() * 5 * me.sys.fps;
            this.destination.x = this.destination.y = 0;

            //this.tracking = null;

            this.stand();
        }
    },

    stand: function() {
        // Force standing animation.
        this.isDirty = true;
        this.standing = true;
        this.sheet.stand(this);
    },

    updateVision: function() {
        var shape = this.body.shapeList[0]; // FIXME! May not always have a shape! :(
        var dir = this.direction;
        var c = Shattered.Enums.Directions;
        var w = shape.bb_l - shape.bb_r - 1;
        var h = shape.bb_b - shape.bb_t - 1;
        this.vision.l = shape.bb_l - (dir == c.West     ? 150 : (dir == c.East  ? w : 75));
        this.vision.b = shape.bb_b - (dir == c.South     ? 150 : (dir == c.North ? h : 75));
        this.vision.r = shape.bb_r + (dir == c.East     ? 150 : (dir == c.West  ? w : 75));
        this.vision.t = shape.bb_t + (dir == c.North    ? 150 : (dir == c.South ? h : 75));
    },

    checkMovement: function() {

        if(this.playerControlled) {
            this.checkPlayerMovement();
            return;
        }

        var self = this;

        /*
        if (self.angry) {
            var space = cm.getSpace();
            space.bbQuery(self.vision, Shattered.Chipmunk.Layers.Player, 0, function (shape) {
                var obj = me.game.getEntityByGUID(shape.data.GUID);
                if ((!self.tracking || (self.tracking == obj)) && !obj.angry) {
                    // Acquire target.
                    self.tracking = obj;
                    self.destination.x = shape.body.p.x;
                    self.destination.y = me.video.getHeight() - shape.body.p.y;

                    // Wake up.
                    self.sleep = 0;
                }
            });
        }
        */

        if (--self.sleep > 0) {
            return;
        }

        self.standing = false;

        var x = self.body.p.x;
        var y = me.video.getHeight() - self.body.p.y;

        // Choose a nearby random point
        if (!self.destination.x || !self.destination.y) {
            // FIXME: Use a bounding box to set the NPC roaming zone, and
            // cp.bbContainsBB() to validate position!

            var max = self.maxDistance * 2;
            var hMax = self.maxDistance;

            self.destination.x = x + ~~(Math.random() * max - hMax);
            self.destination.y = y + ~~(Math.random() * max - hMax);
        }

        // Decide direction to destination.
        var force = {
            "x" : self.destination.x - x,
            "y" : self.destination.y - y
        };

        // Decide distance based on destTolerance.
        force.x = (Math.abs(force.x) < self.destTolerance) ? 0 : force.x.clamp(-1, 1);
        force.y = (Math.abs(force.y) < self.destTolerance) ? 0 : force.y.clamp(-1, 1);

        // Set direction, favoring X-axis.
        if (force.y) {
            self.dir_name = (force.y < 0 ? "up" : "down");
        }
        if (force.x) {
            self.dir_name = (force.x < 0 ? "left" : "right");
        }

        // Set animation.
        this.sheet.walk(this);


        // Calculate directional velocity.
        force.x *= self.velocity * me.timer.tick;
        force.y *= self.velocity * me.timer.tick;
        if (force.x && force.y) {
            force.x *= self.walk_angle;
            force.y *= self.walk_angle;
        }
        // Run when tracking prey.
//        if (self.tracking) {
//            force.x *= 1.5;
//            force.y *= 1.5;
//        }

        if ((self.sleep < -10) && !~~self.body.vx && !~~self.body.vy) {
            self.resetRoam();
        }
        else {
            // Walk toward the destination.
            self.isDirty = true;
            self.body.applyForce(cp.v(force.x * self.forceConstant, force.y * -self.forceConstant), cp.vzero);
        }

        if (~~self.body.vy !== 0) {
            Shattered.Status.wantsResort = true;
        }
    },

    checkPlayerMovement : function() {
        if(this.currentAction && this.currentAction !== "walk")
            return;

        var self = this;

        var force = {
            "x" : 0,
            "y" : 0
        };
        var velocity = self.velocity;

        // Set the movement speed.
        if (!me.input.keyStatus(Shattered.Enums.Input.Run)) {
            // Walk.
            self.animationspeed = 6;
        }
        else {
            // Run.
            velocity *= 2;
            self.animationspeed = 3;
        }

        this.standing = true;

        // Walking controls.
        var moveForce = velocity * me.timer.tick;
        if(me.input.isKeyPressed(Shattered.Enums.Input.North))
            force.y -= moveForce;
        if(me.input.isKeyPressed(Shattered.Enums.Input.South))
            force.y += moveForce;
        if(me.input.isKeyPressed(Shattered.Enums.Input.East))
            force.x += moveForce;
        if(me.input.isKeyPressed(Shattered.Enums.Input.West))
            force.x -= moveForce;

        if(force.x && force.y) {
            // diagonal move, slow down a little
            force.x *= self.walk_angle;
            force.y *= self.walk_angle;
        }

        if(force.x || force.y)
            this.standing = false;

        var oldDir = this.direction;
        if(force.y)
            this.direction = force.y < 0 ? Shattered.Enums.Directions.North : Shattered.Enums.Directions.South;
        if(force.x)
            this.direction = force.x < 0 ? Shattered.Enums.Directions.West : Shattered.Enums.Directions.East;

        // Move body and detect collisions.
        self.body.applyForce(cp.v(force.x * self.forceConstant, force.y * -self.forceConstant), cp.vzero);

        if (~~self.body.vy !== 0) {
            Shattered.Status.wantsResort = true;
        }

        // Update animation if necessary.
        var moving = ~~self.body.vx !== 0 || ~~self.body.vy !== 0;

        if(moving && (!this.currentAction || (this.currentAction === "walk" && oldDir !== this.direction))) {
            this.sheet.walk(this);
            this.currentAction = "walk";
        } else if(!moving && this.currentAction === "walk") {
            this.stand();
            this.currentAction = null;
        }

        self.isDirty = (self.isDirty || moving);
    },

    interact: function(actor) {
        // Turn 2 clicks (180 degrees) from actor's direction.
        this.turn(2, actor.direction);
        Shattered.dialog(["Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses."]);
    },

    checkInteraction: function() {
        if(!this.playerControlled) {
            // TODO: NPC AI.
            return;
        }

        var self = this;

        // Interaction controls.
        if (me.input.isKeyPressed(Shattered.Enums.Input.Action)) {
            var bb = self.body.shapeList[0].getBB();
            var hw = ~~((bb.r - bb.l) / 2);
            var hh = ~~((bb.t - bb.b) / 2);

            var c = Shattered.Enums.Directions;

            var v = [
                hw * ((self.direction === c.West) ? -1 : ((self.direction === c.East) ? 1 : 0)),
                hh * ((self.direction === c.North) ? -1 : ((self.direction === c.South)  ? 1 : 0))
            ];
            var p = cp.v(
                self.body.p.x + v[0] + self.body.shapeList[0].data.offset.x,
                self.body.p.y - v[1] + self.body.shapeList[0].data.offset.y
            );
            var sensor = cm.bbNewForCircle(p, 3);

            var interacted = false;
            this.target = null;
            cm.getSpace().bbQuery(sensor, Shattered.Chipmunk.Layers.Interactive, 0, function onBBQuery(shape) {
                // DO SOMETHING!
                //console.log("interact with %o", shape.data.GUID);
                self.target = me.game.getEntityByGUID(shape.data.GUID);
                self.target.interact(self);
                interacted = true;
            });

            if(!interacted && self.currentAction !== "melee") {
                self.body.resetForces();
                self.currentAction = "melee";
                self.sheet.slash(this, function() { self.currentAction = null; self.stand(); }, function() { self.children.sword.slash(); });
            }
        }
    },

    // Turn NPC clockwise by a certain number of clicks, with optional starting direction.
    // 1 click == 90 degrees.
    turn: function(clicks, dir) {
        dir = dir || this.direction;
        this.direction = (dir + clicks) % 4;

        if(this.standing)
            this.sheet.stand(this);
        else
            this.sheet.walk(this);

        this.isDirty = true;
    },

    update: function() {
        if(!Shattered.Control.updateAllowed(this))
            return false;

        this.isDirty = false;

        this.body.resetForces();

        this.updateVision();
        this.checkMovement();
        this.checkInteraction();

        return this.parent() || this.isDirty;
    },

    draw: function(context, x, y) {
        this.parent(context, x, y);

        if (Shattered.Settings.debug) {
            context.save();
            var viewport = me.game.viewport.pos;

            // Draw a line to the destination.
            if (this.destination.x || this.destination.y) {
                context.strokeStyle = "red";
                context.moveTo(this.body.p.x - viewport.x, me.video.getHeight() - this.body.p.y - viewport.y);
                context.lineTo(this.destination.x - viewport.x, this.destination.y - viewport.y);
                context.stroke();
            }

            /*
            // Draw the vision box.
            if (this.angry) {
                context.lineWidth = 2;
                context.strokeStyle = (this.tracking ? "red" : "orange");
            }
            else {
            */
                context.lineWidth = 1;
                context.strokeStyle = "green";
            //}

            context.strokeRect(
                this.vision.l - viewport.x,
                me.video.getHeight() - this.vision.t - viewport.y,
                this.vision.r - this.vision.l,
                this.vision.t - this.vision.b
            );
        }
    }
});