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
    EquipmentSlot: { Head: "Head", Body: "Body", Hands: "Hands", Legs: "Legs", Feet: "Feet", MainHand: "MainHand", OffHand: "OffHand" },

    /** @enum {int} */
    Gender: { Male: "Male", Female: "Female", None: "None" },

    /** @enum {int} */
    ArmorType: { Cloth: "Cloth", Leather: "Leather", Chain: "Chain", Plate: "Plate" },

    /** @enum {int} */
    ItemType: { Usable: 1, Loot: 2, Armor: 3, Weapon: 4 },

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
        PreHair: 10,
        Hair: 11,
        PostHair: 12,
        PreHead: 13,
        Head: 14,
        PostHead: 15,
        PreWeapon: 16,
        Weapon: 17,
        PostWeapon: 18,
        Last: 19
    }
};