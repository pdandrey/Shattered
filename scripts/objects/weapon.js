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

Shattered.Objects.Weapon = me.AnimationSheet.extend({
    init: function(x, y, owner, settings) {
        var image = (typeof(settings.image) === "string" ? me.loader.getImage(settings.image) : item.image);
        var sheet = Shattered.Resources.getSpriteSheet(settings.image);

        this.parent(x,y,image,sheet.width,sheet.height);
        this.owner = owner;
        this.settings = settings;

        sheet.apply(this);
        this.sheet = sheet;

        if("visible" in settings) {
            this.visible = settings.visible;
        }

//        if(settings.offset)
//            this.offset = new me.Vector2d(settings.offset.x, settings.offset.y);

        this.setCurrentAnimation("slash_" + owner.direction);
        this.animationpause = true;
        this.updatePosition();
    },

    updatePosition: function() {
        this.pos.x = this.owner.pos.x + this.settings.offset.x;
        this.pos.y = this.owner.pos.y + this.settings.offset.y;
        this.direction = this.owner.direction;
    },

    slash: function() {
        this.sheet.slash(this, this.onAnimateFinished, this.onBeforeAnimate);
    },

    onBeforeAnimate: function() {
        this.updatePosition();
        this.visible = true;
        this.animationpause = false;
    },

    onAnimateFinished: function() {
        this.animationpause = true;
        this.visible = false;
    },

    update: function() {
        this.updatePosition();

        if(this.visible) {
            this.parent();
            this.current.idx = this.owner.current.idx;
        }
    }
});