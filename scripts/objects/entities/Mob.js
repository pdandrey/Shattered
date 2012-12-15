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

        if(settings.pathData)
            settings.pathData = JSON.parse(settings.pathData);
        self.destination = new Shattered.Objects.Destination(this, settings.pathData);

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
        if(this.playerControlled) {
            this.destination.clear();
            this.sleep = 1;
            this.stand();
        } else if (this.sleep <= 0) {
            // Sleep for a random period between 0 - 5 seconds.
            this.sleep = Math.random() * 5 * me.sys.fps;
            this.destination.clear();
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

    getDirection: function(force) {
        if(force.y)
            return force.y < 0 ? Shattered.Enums.Directions.North : Shattered.Enums.Directions.South;
        else if(force.x)
            return force.x < 0 ? Shattered.Enums.Directions.West : Shattered.Enums.Directions.East;
        else
            return this.direction;
    },

    checkMovement: function() {

        var self = this;

        if(!this.playerControlled) {
            if (--self.sleep > 0) {
                return;
            }

            if(this.destination.isDestinationReached())
                this.destination.next();

        } else if(!this.destination.isDestinationReached()) {
            --this.sleep;
        }

        // Decide direction to destination.
        var force = this.destination.getForce();

        var oldDir = this.direction;
        this.direction = this.getDirection(force);

        // Set animation.
        //this.sheet.walk(this);

        var moving = ~~self.body.vx !== 0 || ~~self.body.vy !== 0;

        if (self.sleep < -10 && !moving) {
            self.resetRoam();
        } else {
            // Walk toward the destination.
            self.isDirty = true;
            self.body.applyForce(cp.v(force.x * self.forceConstant, force.y * -self.forceConstant), cp.vzero);
        }

        if(moving && (!this.currentAction || (this.currentAction === "walk" && oldDir !== this.direction))) {
            this.sheet.walk(this);
            this.currentAction = "walk";
        } else if(!moving && this.currentAction === "walk") {
            this.stand();
            this.currentAction = null;
        }

        if (~~self.body.vy !== 0) {
            Shattered.Status.wantsResort = true;
        }

        self.isDirty = (self.isDirty || moving);
    },

    interact: function(actor) {
        // Turn 2 clicks (180 degrees) from actor's direction.
        this.body.resetForces();
        this.turn(2, actor.direction);
        Shattered.dialog(["Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses. Why hello there. How are you? I like dresses."]);
    },

    checkInteraction: function() {
        if(!this.playerControlled) {
            // TODO: NPC AI.
            return false;
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
                self.body.resetForces();
                self.target = me.game.getEntityByGUID(shape.data.GUID);
                self.target.interact(self);
                interacted = true;
            });

            if(!interacted && self.currentAction !== "melee") {
                self.body.resetForces();
                self.currentAction = "melee";
                self.sheet.slash(this, function() { self.currentAction = null; self.stand(); }, function() { self.children.sword.slash(); });
                interacted = true;
            }
            return interacted;
        }
        return false;
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
        if(!Shattered.Control.updateAllowed(this)) {
            return false;
        }

        this.isDirty = false;

        this.body.resetForces();

        if(this.checkInteraction())
            return false;

        this.updateVision();
        this.checkMovement();

        return this.parent() || this.isDirty;
    },

    draw: function(context, x, y) {
        this.parent(context, x, y);

        if (Shattered.Settings.debug) {
            // Draw a line to the destination.
            this.destination.draw(context, x, y);

            context.save();
            context.lineWidth = 1;
            context.strokeStyle = "green";
            var viewport = me.game.viewport.pos;
            context.strokeRect(
                this.vision.l - viewport.x,
                me.video.getHeight() - this.vision.t - viewport.y,
                this.vision.r - this.vision.l,
                this.vision.t - this.vision.b
            );
            context.restore();
        }
    }
});
