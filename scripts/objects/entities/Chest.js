"use strict";

Shattered.Objects.Entities.Chest = Shattered.Objects.Sprite.extend({
    init: function(x, y, settings) {
        settings.image = "chests";

        var sheet = this.sheet = Shattered.Resources.getSpriteSheet("chests");

        settings.spriteheight = sheet.height;
        settings.spritewidth = sheet.width;

        this.parent(x, y, settings);

        this.body.setMass(Infinity);
        this.sheet.apply(this);

        this.animationpause = true;

        if(settings.type)
            settings.type = settings.type.toLowerCase();

        if(settings.type !== "square")
            settings.type = "rounded";

        this.setCurrentAnimation(settings.type, this.chestOpened);

        this.body.eachShape(function(shape) {
            shape.setLayers(
                Shattered.Chipmunk.Layers.Interactive
                | Shattered.Chipmunk.Layers.Mob
            )
        });

        this.isOpened = false;
    },

    interact: function(actor, callback) {
        if(!this.isOpened) {
            this.animationpause = false;
            this.actor = actor;
            this.callback = callback;
            this.isOpened = true;
        }
    },

    chestOpened: function() {
        this.animationpause = true;
        this.setAnimationFrame(2);

        Shattered.dialog(["You opened a chest"]);

        if(typeof(this.callback) === 'function')
            this.callback.call(this.actor, this);
    }
});
