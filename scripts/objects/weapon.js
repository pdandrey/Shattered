/**
 * Shattered, A Fantasy RPG
 * Copyright (c) 2012 Dave Andrey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * ========================
 * Software and source code
 * ========================
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
 *
 * For more information, see COPYING.txt and gpl-3.0.txt.
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