"use strict";

Shattered.Objects.PlayScreen = me.ScreenObject.extend({
    init: function() {
        this.parent(true);
    },
    onResetEvent: function() {
        me.levelDirector.loadLevel("test");
    },
    update: function() {
        if (Shattered.Status.wantsResort) {
            Shattered.Status.wantsResort = false;
            me.game.sort.defer(this.sort);
            return true;
        }
        return false;
    },

    sort : function (a, b) {
        var az = a.z;
        var bz = b.z;

        if(a.body)
            az = a.z + ((me.video.getHeight() - a.body.shapeList[0].bb_b) / 32 / 1000);
        if(b.body)
            bz = b.z + ((me.video.getHeight() - b.body.shapeList[0].bb_b) / 32 / 1000);

        return (bz - az);
    },

    draw: function(context) {
        this.parent(context);

        // day/night, round 1
        var overlay = [
            "rgba(0, 0, 0, 0.8)",
            "rgba(0, 16, 60, 0.7)",
            "rgba(0, 12, 70, 0.6)",
            "rgba(5, 33, 111, 0.5)",
            "rgba(0, 43, 140, 0.4)",
            "rgba(0, 91, 194, 0.3)",
            "rgba(0, 122, 216, 0.2)",
            "rgba(0, 200, 198, 0.1)",

            "rgba(215, 238, 124, 0.1)",
            "rgba(180, 169, 0, 0.1)",
            "rgba(158, 89, 0, 0.2)",
            "rgba(112, 18, 0, 0.3)",
            "rgba(88, 0, 52, 0.4)",
            "rgba(60, 0, 45, 0.5)",
            "rgba(45, 0, 76, 0.6)",
            "rgba(0, 0, 60, 0.7)"
        ];

        var idx = null;
        if(Shattered.Status.time < 8)
            idx = ~~Shattered.Status.time;
        else if(Shattered.Status.time >= 16)
            idx = ~~Shattered.Status.time - 8;

        if(idx != null) {
            context.save();
            context.fillStyle = overlay[idx];
            context.fillRect(0, 0, me.video.getWidth(), me.video.getHeight());
            context.restore();
        }
    }
});