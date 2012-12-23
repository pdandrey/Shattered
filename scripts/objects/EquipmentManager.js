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

(function() {

    var EquipmentManager = Shattered.Objects.EquipmentManager = function EquipmentManager(equipment, gender, fnRedraw) {
        this._equipment = {};
        this._character = equipment;
        this._redraw = false;
        this._fnRedraw = fnRedraw;
        this._gender = gender;

        for(var slot in Shattered.Enums.EquipmentSlot) {
            this._equipment[Shattered.Enums.EquipmentSlot[slot]] = null;
        }
        if(equipment) {
            for(var key in equipment) {
                var item = Shattered.Library.getItem(equipment[key], key);
                if(item)
                    this.equip(item);
            }
        }

        this._redraw = true;
    };

    /**
     * Equip a piece of equipment
     * @param {Shattered.Objects.Items.Equipment} item The item to equip.
     */
    EquipmentManager.prototype.equip = function(item) {
        if(this._equipment[item.equipmentSlot] == item)
            return false;

        if(!(item instanceof Shattered.Objects.Items.Equipment))
            throw "Item is not equipable";

        this._equipment[item.equipmentSlot] = item;
        this._character[item.equipmentSlot] = { name: item.name, type: item.type, subtype: item.equipmentSlot };

        if(this._redraw && this._fnRedraw)
            this._fnRedraw();

        return true;
    };

    EquipmentManager.prototype.unequip = function(slot) {
        if(!slot)
            throw "Must specify slot to unequip";

        var item = this._equipment[slot];
        this._equipment[slot] = null;
        this._character[slot] = null;

        if(this._redraw && this._fnRedraw)
            this._fnRedraw();

        return item;
    };

    EquipmentManager.prototype.unequipAll = function() {
        var tmp = this._redraw;
        this._redraw = false;
        var items = [];

        for(var slot in Shattered.Enums.EquipmentSlot)
            items.push(this.unequip(slot));

        this._redraw = tmp;
        if(this._redraw && this._fnRedraw)
            this._fnRedraw();

        return items;
    };

    EquipmentManager.prototype.getSpriteImages = function() {
        var ret = [];

        for(var slotkey in Shattered.Enums.EquipmentSlot) {
            var slot = Shattered.Enums.EquipmentSlot[slotkey];
            if(this._equipment[slot]) {
                var images = this._equipment[slot].getSpriteImages(this._gender);
                for(var i=0; i<images.length; ++i) {
                    ret.push(images[i]);
                }
            }
        }

        ret.sort(Shattered.Objects.LayerSprite.fnSort);

        return ret;
    }
})();