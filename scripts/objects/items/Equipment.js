/**
 * Shattered
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

Shattered.Objects.Items.Equipment = Shattered.Objects.Items.Item.extend({
    __classname: "Equipment",

    /**
     * Creates a new piece of equipment
     * @param {object} properties Properties of the item
     * @param {object|string[]} properties.sprites Definition of the images used for sprites
     * @param {string[]} properties.sprites.male
     * @param {string[]} properties.sprites.female
     * @param {Shattered.Enums.EquipmentSlot} properties.slot The slot where the item is equipped
     * @param {Shattered.Enums.SpriteDrawOrder} [properties.layerOverride] The layer to draw on
     * @param {int} [properties.layerOffset = 0] Relative offset of the images in the layer.
     * @see {Shattered.Objects.Items.Item#init}
     * @constructor
     */
    init: function(properties) {
        this.parent(properties);

        if(!properties.sprites)
            throw "Equipment must contain EquipmentSprites as an array or separate male/female arrays";

        if(!Array.isArray(properties.sprites)) {
            if(!Array.isArray(properties.sprites.male) || !Array.isArray(properties.sprites.female))
                throw "Equipment must contain EquipmentSprites as an array or separate male/female arrays";
            else {
                convert(properties.sprites.male);
                convert(properties.sprites.female);
            }
        } else {
            convert(properties.sprites);
        }

        function convert(arr, slot) {
            for(var i=arr.length; i>=0; --i) {
                if(typeof(arr[i]) === "string") {
                    arr[i] = new Shattered.Objects.Items.Equipment.EquipmentSprite(arr[i]);
                } else if(!(arr[i] instanceof Shattered.Objects.Items.Equipment.EquipmentSprite)) {
                    arr[i] = new Shattered.Objects.Items.Equipment.EquipmentSprite(arr[i].image, arr[i].layerOverride, arr[i].layerOffset);
                }

                var prefix = Shattered.Resources.getImagePrefixFromEquipmentSlot(slot);
                arr[i].image = prefix + arr[i].image;
            }
        }

        if(!properties.slot)
            throw "Equipment must have a slot";

        switch(properties.slot) {
            case Shattered.Enums.EquipmentSlot.Body:
            case Shattered.Enums.EquipmentSlot.Feet:
            case Shattered.Enums.EquipmentSlot.Hands:
            case Shattered.Enums.EquipmentSlot.Head:
            case Shattered.Enums.EquipmentSlot.Legs:
            case Shattered.Enums.EquipmentSlot.MainHand:
            case Shattered.Enums.EquipmentSlot.OffHand:
                break;
            default:
                throw "Invalid equipment slot";
        }

        properties.layerOffset = properties.layerOffset || 0;

        if(!properties.layerOverride) {
            switch(properties.slot) {
                case Shattered.Enums.EquipmentSlot.Body: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Body; break;
                case Shattered.Enums.EquipmentSlot.Feet: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Feet; break;
                case Shattered.Enums.EquipmentSlot.Hands: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Hands; break;
                case Shattered.Enums.EquipmentSlot.Head: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Head; break;
                case Shattered.Enums.EquipmentSlot.Legs: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Legs; break;
                case Shattered.Enums.EquipmentSlot.MainHand:
                case Shattered.Enums.EquipmentSlot.OffHand: properties.layerOverride = Shattered.Enums.SpriteDrawOrder.Weapon; break;
            }
        }

        Object.defineProperties(this, {
            equipmentSlot: { value: properties.slot, writable:false, configurable: false, enumerable: true }
        });
    },

    /**
     * Returns the sprite images of the equipment
     * @param {Shattered.Enums.Gender} gender
     * @returns {Shattered.Objects.Items.Equipment.EquipmentSprite[]} Array of equipment sprites
     */
    getSpriteImages: function(gender) {
        var common = Array.isArray(this._properties.sprites) ? this._properties.sprites : null;

        switch(gender) {
            case Shattered.Enums.Gender.Male: return [].concat(common || this._properties.sprites.male);
            case Shattered.Enums.Gender.Female: return [].concat(common || this._properties.sprites.female);
            default: throw "invalid gender: " + gender;
        }
    }
});

/**
 *
 * @param {string} image Image part name for the sprite item
 * @param {Shattered.Enums.SpriteDrawOrder} [layerOverride = equipment's draw order]
 * @param {int} [layerOffset = equipment's offset]
 * @constructor
 */
Shattered.Objects.Items.Equipment.EquipmentSprite = function(image, layerOverride, layerOffset) {
    this.image = image;
    this.layerOverride = layerOverride;
    this.layerOffset = layerOffset;
};


Shattered.Objects.Items.Armor = Shattered.Objects.Items.Equipment.extend({
    __classname: "Armor",

    /**
     * Creates a new armor
     * @param {object} properties Properties of the object.
     * @param {int} properties.baseDefense The base defense of the armor
     * @param {Shattered.Enums.ArmorType} properties.type The type of armor
     * @constructor
     * @see {Shattered.Objects.Item.Equipment#init}
     */
    init: function(properties) {
        this.parent(properties);
        Object.defineProperties(this, {
            type: { value: properties.type, writable:false, configurable:false, enumerable:true }
        })
    }
});