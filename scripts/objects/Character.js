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

(function() {

    var spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 832;
    spriteCanvas.height = 1344;
    var context = spriteCanvas.getContext("2d");

    function colorHair(sprite) {
        var hair = Shattered.Resources.getBaseHairImage(sprite, function() { colorHair(sprite); });
        if(hair == null)
            return;

        clearCanvas();
        context.drawImage(hair, 0, 0);

        var imgData = context.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);
        var color = sprite.color;

        if(color) {
            var pix = imgData.data;
            // Loop over each pixel and change the color.
            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i  ] = pix[i  ] * color[0] / 255; // red
                pix[i+1] = pix[i+1] * color[1] / 255; // green
                pix[i+2] = pix[i+2] * color[2] / 255; // blue
                // pix[i+3] is alpha channel (ignored)
            }
            // Draw the result on the canvas
            context.putImageData(imgData, 0, 0);
        }

        Shattered.Resources.cacheHairImage(sprite, spriteCanvas.toDataURL());
    }

    function clearCanvas() {
        context.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
    }

    Shattered.Objects.Character = Object.extend({
        __classname: "Character",

        /**
         *
         * @param {{name:string, base:string, hair:string, gender:Shattered.Enums.Gender, equipment: Object.<Shattered.Enums.EquipmentSlot, {name:string, type:Shattered.Enums.ItemType}>}} properties
         * @param {string} properties.name The character's name
         * @param {string} properties.base The character's base color
         * @param {string} [properties.hair] The character's hair
         * @param {Shattered.Enums.Gender} properties.gender The character's gender
         * @constructor
         */
        init: function(properties) {
            if(!properties)
                throw "Characters must have properties";
            if(!String.validate(properties.name))
                throw "Character must have a name";
            switch(properties.gender) {
                case Shattered.Enums.Gender.Male:
                case Shattered.Enums.Gender.Female:
                    break;
                default:
                    throw "Character must have a gender";
            }
            if(!String.validate(properties.base))
                throw "Character must have a base";

            properties.base = new Shattered.Objects.LayerSprite("base_" + properties.base, Shattered.Enums.SpriteDrawOrder.Base, 0);
            //properties.base.type = "base";

            if(!properties.equipment) {
                properties.equipment = {};
            }

            if(String.validate(properties.hair)) {
                properties.hair = new Shattered.Objects.LayerSprite(properties.hair, Shattered.Enums.SpriteDrawOrder.Hair, 0);
                properties.hair.type = "hair";
                if(properties.hairColor)
                    properties.hair.color = properties.hairColor;
                colorHair(properties.hair);
            }

            this._properties = properties;

            this.equipment = new Shattered.Objects.EquipmentManager(properties.equipment, properties.gender, this.redraw.bind(this));

            this.redraw.bind(this).defer();
        },

        redraw: function(images) {

            if(!images) {
                images = this.equipment.getSpriteImages();
                images.push(this._properties.hair);
                images.push(this._properties.base);
                images.sort(Shattered.Objects.LayerSprite.fnSort);
                images.reverse();
                clearCanvas();
            }

            while(images.length) {
                var layer = images[images.length-1];
                var img = null;
                if(layer.type === "hair") {
                    img = Shattered.Resources.getHairImage(layer);
                } else {
                    img = Shattered.Resources.getSpriteImage(layer, this._properties.gender, (function() { this.redraw(images); }).bind(this));
                }

                if(!img)
                    return;

                images.pop();

                context.drawImage(img, 0, 0);
            }

            var data = spriteCanvas.toDataURL();
            me.game.getEntityByName("player")[0].image.src = data;
        }
    });

})();