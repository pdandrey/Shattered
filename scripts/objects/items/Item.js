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

Shattered.Objects.Items.Item = Object.extend({
    __classname: "Item",

    /**
     * Constructor
     * @param {object} properties Properties of the item
     * @param {string} properties.name Item name
     * @param {string} [properties.icon] Image icon for the item
     * @param {Shattered.Enums.ItemType} properties.type The type of the item
     * @constructor
     */
    init: function(properties) {
        if(!properties)
            throw "Item must have properties";
        if(!properties.name || typeof(properties.name) !== "string" || properties.name.length === 0)
            throw "Item must have a name";
        if(!properties.type)
            throw "Item must have a type";

        this._properties = properties;

        Object.defineProperties(this, {
            name: {value: properties.name, writable: false, configurable: false, enumerable: true },
            type: {value:properties.type, writable: false, configurable:false, enumerable: true }
        });
    }
});