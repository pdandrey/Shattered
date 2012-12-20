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

Shattered.Objects.Items.Equipment = Shattered.Objects.Items.Item.extend({
    __classname: "Equipment",

    /**
     * Creates a new piece of equipment
     * @param {object} properties Properties of the item
     * @param {object} properties.sprites Definition of the images used for sprites
     * @param {Shattered.Objects.Items.Equipment.EquipmentSprite[]} properties.sprites.male
     * @param {Shattered.Objects.Items.Equipment.EquipmentSprite[]} properties.sprites.female
     * @param {Shattered.Enums.EquipmentSlot} properties.slot The slot where the item is equipped
     * @see {Shattered.Objects.Items.Item#init}
     * @constructor
     */
    init: function(properties) {
        this.parent(properties);

        Object.defineProperties(this, {
            equipmentSlot: { value: properties.slot, writable:false, configurable: false, enumerable: true }
        })
    }
});

/**
 *
 * @param {url} image Image URL for the sprite item
 * @param {int} [layerOverride = 0] unused
 * @constructor
 */
Shattered.Objects.Items.Equipment.EquipmentSprite = function(image, layerOverride) {
    Object.defineProperties(this, {
        image: { value: image, writable: false, configurable: false, enumerable: true },
        layerOverride: { value: layerOverride || 0, writable: false, configurable: false, enumerable: true }
    });
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