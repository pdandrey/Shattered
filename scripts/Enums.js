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

Shattered.Enums = {

    /** @enum {int} */
    Directions: { North: 0, South: 2, East: 1, West: 3 },

    /** @enum {string} */
    Input: { North: "north", South: "south", East: "east", West: "west", Action: "action", Run: "run" },

    /** @enum {int} */
    Updates: { Player: 1, NPC: 2, Dialog: 4 },

    /** @enum {int} */
    EquipmentSlot: { Head: 1, Body: 2, Hands: 3, Legs: 4, Feet: 5, MainHand: 6, OffHand: 7 },

    /** @enum {int} */
    Gender: { Male: 1, Female: 2, None: 3 },

    /** @enum {int} */
    ArmorType: { Cloth: 1, Leather: 2, Chain: 3, Plate: 4 },

    /** @enum {int} */
    SpriteDrawOrder: {
        Base: 0,
        PreFeet: 1,
        Feet: 2,
        PostFeet: 3,
        PreLegs: 4,
        Legs: 5,
        PostLegs: 6,
        PreBody: 7,
        Body: 8,
        PostBody: 9,
        PreHead: 10,
        Head: 11,
        PostHead: 12,
        PreWeapon: 13,
        Weapon: 14,
        PostWeapon: 15,
        Last: 16
    }
};