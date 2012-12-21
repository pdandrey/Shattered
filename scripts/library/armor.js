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

Shattered.Library.Armor = {
    Body: {
        "worn leather jerkin": new Shattered.Objects.Items.Armor({
            name: "Worn Leather Jerkin",
            slot: Shattered.Enums.EquipmentSlot.Body,
            armorType: Shattered.Enums.ArmorType.Leather,
            sprites: ["leather"]
        })
    },
    Legs: {
        "worn leather pants": new Shattered.Objects.Items.Armor({
            name: "Worn Leather Pants",
            slot: Shattered.Enums.EquipmentSlot.Legs,
            armorType: Shattered.Enums.ArmorType.Leather,
            sprites: ["cloth_green"]
        })
    },
    Feet: {
        "worn leather shoes": new Shattered.Objects.Items.Armor({
            name: "Worn Leather Shoes",
            slot: Shattered.Enums.EquipmentSlot.Feet,
            armorType: Shattered.Enums.ArmorType.Leather,
            sprites: ["brown"]
        })
    }
};