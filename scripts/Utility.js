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

Shattered.Utility = (function() {

    var videoHeight = null;

    return {
        /**
         * Checks to see if a value is a number
         * @param value The value to check
         * @return {boolean}
         */
        isNumeric: function(value) {
            var type = typeof(value);
            switch(type) {
                case "number":
                    return isFinite(value);
                case "string":
                    return value.isNumeric();
                default:
                    return false;
            }
        },

        /**
         * Checks to see if an object is an object and not an array
         * @param object The object to test
         * @return {Boolean}
         */
        isObject : function(object) {
            try {
                return !Array.isArray(object) && Object.keys(object);
            }
            catch (e) {
                return false;
            }
        },

        getImage: function(name) {
            var result = me.loader.getImage(name);
            if (!result) {
                throw "Error: No image named `" + name + "` (Did you forget to include the resource?)";
            }
            return result;
        },

        getHeight: function() {
            if(!videoHeight)
                videoHeight = me.video.getHeight();
            return videoHeight;
        }
    };
})();