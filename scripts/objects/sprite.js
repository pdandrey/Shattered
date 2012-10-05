/*
 * Shattered, a Fantasy RPG
 * Copyright (C) 2012  Dave Andrey
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

"use strict";

/* A Chipmunk-controlled entity */

Shattered.Chipmunk = {
    Objects: {},

    Layers: {
        None: 0,
        Player: 1,
        Mob: 2,
        Exit: 4,
        Interactive: 8,
        Walls: 16,

        All: 0xFFFFFFFF
    },

    Collision: {
        Player: 1,
        Exit: 2,
        Enemy: 4,
        Friend: 8
    }
};

Shattered.Chipmunk.Objects.ChipmunkSprite = me.AnimationSheet.extend({
    "init" : function init(x, y, settings) {
        var shape;
        var space = cm.getSpace();

        this.hWidth = ~~(settings.spritewidth / 2);
        this.hHeight = ~~(settings.spriteheight / 2);

        this.body = space.addBody(new cp.Body(1, Infinity));
        this.body.setPos(cp.v(x + this.hWidth, me.video.getHeight() - y - this.hHeight));

        this.GUID = this.GUID || settings.GUID;
        this.name = this.name || settings.name;
        this.spritewidth = this.spritewidth || settings.spritewidth;
        this.spriteheight = this.spriteheight || settings.spriteheight;

        this.setShape(settings.shape);

        this.parent(
            x,
            y,
            (typeof(settings.image) === "string") ? me.loader.getImage(settings.image) : settings.image,
            settings.spritewidth,
            settings.spriteheight
        );
    },

    setShape: function(shapeSettings) {
        var shape = null;
        var space = cm.getSpace();
        var body = this.body;

        if(body.shapeList.length > 0) {
            space.removeShape(body.shapeList[0]);
        }

        if (shapeSettings) {
            switch (shapeSettings.type) {
                case "polygon":
                case "segment":
                    throw "Error: Unimplemented shape `" + settings.shape.type + "`";

                case "circle":
                    shape = space.addShape(new cp.CircleShape(this.body, shapeSettings.radius, shapeSettings.offset));
                    console.log("adding circle shape for %s", this.name);
                    break;

                default:
                    throw "Error: Unknown shape `" + shapeSettings.type + "`";
            }
        }
        else {
            shape = space.addShape(cp.BoxShape(this.body, this.spritewidth, this.spriteheight));
            console.log("adding default shape for %s", this.name);
        }

        shape.data = {
            GUID: this.GUID,
            name: this.name
        };
        if (shapeSettings && shapeSettings.offset) {
            shape.data.offset = {
                x: shapeSettings.offset.x,
                y: shapeSettings.offset.y
            };
        }

        shape.setLayers(Shattered.Chipmunk.Layers.Mob
            | Shattered.Chipmunk.Layers.Player
            | Shattered.Chipmunk.Layers.Interactive
            | Shattered.Chipmunk.Layers.Walls
        );
    },

    "adjustBoxShape" : function adjustBoxShape(x, y, w, h) {
        this.body.shapeList[0].data.offset = {
            "x" : x,
            "y" : -y
        };
        this.body.shapeList[0].setVerts(cm.bb2verts(
            -(~~(w / 2) - x),
            ~~(h / 2) + y,
            w,
            h
        ), cp.vzero);
    },

    "update" : function update() {
        // Update melonJS state with Chipmunk body state.
        this.pos.x = ~~(this.body.p.x - this.hWidth);
        this.pos.y = ~~(me.video.getHeight() - this.body.p.y - this.hHeight);

        return this.parent();
    },

    draw: function(context, x, y) {
        this.parent(context, x, y);

        if(Shattered.Settings.debug) {
            context.save();
            var viewport = me.game.viewport.pos;
            var body = this.body.shapeList[0];
            context.lineWidth = 1;
            context.strokeStyle = "yellow";

            if(body instanceof cp.CircleShape) {
                context.beginPath();
                context.arc(
                    //console.log("(%o, %o), r: %o, %o, %o",
                    body.tc.x - viewport.x,
                    me.video.getHeight() - body.tc.y - viewport.y,
                    body.r,
                    0,
                    2* Math.PI
                );
                context.stroke();
            } else if(body instanceof cp.PolyShape) {
                context.beginPath();
                context.moveTo(body.tVerts[0] - viewport.x, me.video.getHeight() - body.tVerts[1] - viewport.y);
                for(var i=2; i<body.tVerts.length; i+=2) {
                    context.lineTo(body.tVerts[i] - viewport.x, me.video.getHeight() - body.tVerts[i+1] - viewport.y);
                }
                context.closePath();
                context.stroke();
            }

            context.restore();
        }
    }
});

/**
 * Generic sprite composition manager.
 *
 * Instances of this class look just like an ObjectEntity to melonJS.
 * Except it does not have public user functions for handling movement or
 * physics. (That's Chipmunk-js's job!)
 *
 * If a `compose` property is included on the object (in Tiled), this class
 * will parse it as a composition list, and create new child objects from the
 * composition items within the list.
 *
 * The format of a composition list is an array of objects. Each object must
 * contain at least a `name` key. If the `name` === this object's name, no
 * further keys are required. (This allows specifying the rendering order.)
 * Otherwise, ALL of the following keys are required:
 *
 * - name: Name of the sprite to composite.
 * - class: Class for the sprite to composite. (Usually "me.AnimationSheet")
 * - image: Image reference to use for the sprite.
 * - spritewidth: Width (in pixels) of each frame within the animation sheet.
 * - spriteheight: Height (in pixels) of each frame within the animation sheet.
 *
 * Any arbitrary keys can be included on the composition item; the full item is
 * passed to the composited sprite's constructor, in case it needs additional
 * configuration info from Tiled (including its OWN compositions).
 *
 * If a composition list does NOT reference this object's name, this object will
 * be rendered before the composed objects. To change the rendering order, you
 * MUST reference this object's name within the composition list.
 */

Shattered.Objects.Sprite = Shattered.Chipmunk.Objects.ChipmunkSprite.extend({
    "init" : function init(x, y, settings) {
        var self = this;
        var GUID = me.utils.createGUID();

        settings.GUID = GUID;

        // Create this object.
        self.parent(x, y, settings);

        // Set some things that the engine wants.
        self.GUID = GUID;
        self.name = this.name || (settings.name ? settings.name.toLowerCase() : "");
        self.isEntity = true;

        self.composition = [self.name];
        self.children = {};

        // Compose additional sprites.
        if (settings.compose) {
            if(!Array.isArray(settings.compose)) {
                try {
                    settings.compose = JSON.parse(settings.compose);
                }
                catch (e) {
                    throw "Composition setting error. JSON PARSE: " + e + " in " + settings.compose;
                }

                if (!Array.isArray(settings.compose)) {
                    throw "Composition setting error. NOT AN ARRAY: " + JSON.stringify(compose);
                }
            }

            self.compose = settings.compose;
            self.compose.forEach(function forEach(item) {
                self.addCompositionItem(item);
            });

            // Render this object first, if it is not referenced in the composition list.
            if (self.composition.indexOf(self.name) === -1) {
                self.composition.unshift(self.name);
            }
        }
    },

    "addCompositionItem" : function addCompositionItem(item) {
        var self = this;

        // Validate composition item format.
        if (!Shattered.Utility.isObject(item)) {
            throw "Composition setting error. NOT AN OBJECT: " + JSON.stringify(item);
        }

        // Special case for defining rendering order.
        if (item.name === self.name) {
            self.composition.push(item.name);
            return;
        }

        // Require keys.
        [ "name", "class", "image" ].forEach(function forEach(key) {
            if (!item.hasOwnProperty(key)) {
                throw "Composition setting error. MISSING KEY `" + key + "`: " + JSON.stringify(item);
            }
        });

        function getClass(str) {
            var node = window;
            var tokens = str.split(".");
            tokens.forEach(function forEach(token) {
                if (typeof(node) !== "undefined") {
                    node = node[token];
                }
            });
            return node;
        }

        // `class` should usually be "me.AnimationSheet", but can be anything.
        var anim = self.children[item.name] = new (getClass(item.class))(
            self.pos.x,
            self.pos.y,
            self,
            item
        );


        self.composition.push(item.name);
    },

    removeCompositionItem: function(name) {
        if(name in this.children) {
            delete this.children[name];
            var index = this.composition.indexOf(name);
            this.composition.splice(index, 1);
        }
    },

    "setCompositionOrder" : function setCompositionOrder(name, target, after) {
        after = (after ? 1 : -1);

        var current_idx = this.composition.indexOf(name);

        if (typeof(target) === "number") {
            this.composition.splice(current_idx, 1);
            if (target === -1) {
                this.composition.push(name);
            }
            else {
                this.composition.splice(target + +(target < 0), 0, name);
            }
        }
        else {
            var target_idx = this.composition.indexOf(target);

            if (current_idx !== (target_idx + after)) {
                if (current_idx > target_idx) {
                    this.composition.splice(current_idx, 1);
                    this.composition.splice(target_idx, 0, name);
                }
                else {
                    this.composition.splice(target_idx + 1, 0, name);
                    this.composition.splice(current_idx, 1);
                }
            }
        }
    },

    "interact" : function interact(actor) {
        console.warn("Missing interaction for " + this.name + " from " + actor.name);
    },

    "update" : function update() {
        var self = this;
        var results = [];

        // Update this sprite animation.
        results.push(self.parent());

        // Update composited sprite animations.
        if (self.composition) {
            self.composition.forEach(function forEach(name) {
                if (name !== self.name) {
                    results.push(self.children[name].update());
                }
            });
        }

        // Return true if any of the sprites want to be rendered.
        return results.some(function some(result) {
            return result;
        });
    },

    "draw" : function draw(context) {
        //if(!this.offset)
        //    this.offset = new me.Vector2d(0,0);

        if (!this.composition) {
            this.parent(context);
            return;
        }

        // Render all composed sprites in the proper order.
        var self = this;
        self.composition.forEach(function forEach(name) {
            if (name === self.name) {
                self.parent(context);
            }
            else if(self.children[name].visible) {
                self.children[name].draw(context);
            }
        });
    }
});
