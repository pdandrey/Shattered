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
    /**
     *
     * @param {int} width
     * @param {int} height
     * @param {int} [speed]
     * @constructor
     */
    Shattered.Objects.SpriteSheet = function(width, height, speed) {
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.animations = {};
    };

    var standardSheet = null;

    Shattered.Objects.SpriteSheet.getStandardSheet = function() {

        if(!standardSheet) {
            var dir = Shattered.Enums.Directions;

            standardSheet = new Shattered.Objects.SpriteSheet(64, 64)
                .addWalkAnimation(dir.North, 104, 9)
                .addWalkAnimation(dir.West, 117, 9)
                .addWalkAnimation(dir.South, 130, 9)
                .addWalkAnimation(dir.East, 143, 9)
                .addCastAnimation(dir.North, 0, 7)
                .addCastAnimation(dir.West, 13, 7)
                .addCastAnimation(dir.South, 26, 7)
                .addCastAnimation(dir.East, 39, 7)
                .addStabAnimation(dir.North, 52, 8)
                .addStabAnimation(dir.West, 65, 8)
                .addStabAnimation(dir.South, 78, 8)
                .addStabAnimation(dir.East, 91, 8)
                .addSlashAnimation(dir.North, 156, 6)
                .addSlashAnimation(dir.West, 169, 6)
                .addSlashAnimation(dir.South, 182, 6)
                .addSlashAnimation(dir.East, 195, 6)
                .addBowAnimation(dir.North, 208, 13)
                .addBowAnimation(dir.West, 221, 13)
                .addBowAnimation(dir.South, 234, 13)
                .addBowAnimation(dir.East, 247, 13)
                .addDeathAnimation(260, 6);
        }

        return standardSheet;
    };

    /**
     * Sets the indexes for a direction
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addWalkAnimation = function(direction, index, count) {
        setAnimation.call(this, "walk_" + direction, index, count);
        if(Array.isArray(index))
            setAnimation.call(this, "stand_" + direction, index[0], 1);
        else
            setAnimation.call(this, "stand_" + direction, index, 1);
        return this;
    };

    /**
     * Sets the indexes for a direction
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addStabAnimation = function(direction, index, count) {
        setAnimation.call(this, "stab_" + direction, index, count);
        if(Array.isArray(index))
            setAnimation.call(this, "stand_" + direction, index[0], 1);
        else
            setAnimation.call(this, "stand_" + direction, index, 1);
        return this;
    };

    /**
     * Sets the indexes for a direction
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addBowAnimation = function(direction, index, count) {
        setAnimation.call(this, "bow_" + direction, index, count);
        if(Array.isArray(index))
            setAnimation.call(this, "stand_" + direction, index[0], 1);
        else
            setAnimation.call(this, "stand_" + direction, index, 1);
        return this;
    };

    /**
     * Applies the sprite sheet to the sprite object
     * @param {me.AnimationSheet} sprite
     */
    Shattered.Objects.SpriteSheet.prototype.apply = function(sprite) {
        if(this.speed)
            sprite.animationspeed = this.speed;

        var self = this;
        Object.keys(this.animations).forEach(function(key) {
            sprite.addAnimation(key, self.animations[key]);
        });
    };

    Shattered.Objects.SpriteSheet.prototype.stand = function(sprite) {
        sprite.setCurrentAnimation("stand_" + sprite.direction, true);
    };

    Shattered.Objects.SpriteSheet.prototype.walk = function(sprite) {
        sprite.setCurrentAnimation("walk_" + sprite.direction, true);
    };

    Shattered.Objects.SpriteSheet.prototype.cast = function(sprite, callback) {
        var self = this;
        sprite.setCurrentAnimation("cast_" + sprite.direction, function() {
            self.stand(sprite);
            if(callback && typeof(callback) === 'function') {
                callback();
            }
        });
    };

    Shattered.Objects.SpriteSheet.prototype.slash = function(sprite, onAnimateFinished, onBeforeAnimate) {
        var self = this;
        if(!sprite.visible && sprite.animationpause) {
            sprite.setCurrentAnimation("slash_" + sprite.direction);
            sprite.setAnimationFrame(0);
        }

        if(typeof(onBeforeAnimate) === 'function')
            onBeforeAnimate.apply(sprite);

        sprite.setCurrentAnimation("slash_" + sprite.direction, function() {
            if(typeof(onAnimateFinished) === 'function') {
                onAnimateFinished.apply(sprite);
            }
        });
    };

    /**
     * Sets the indexes for a direction
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addSlashAnimation = function(direction, index, count) {
        setAnimation.call(this, "slash_" + direction, index, count);
        return this;
    };

    /**
     * Sets the indexes for a direction
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addCastAnimation = function(direction, index, count) {
        setAnimation.call(this, "cast_" + direction, index, count);
        return this;
    };

    /**
     * Sets the death animation
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addDeathAnimation = function(index, count) {
        setAnimation.call(this, "death", index, count);
        if(Array.isArray(index))
            setAnimation.call(this, "dead", [index[0]]);
        else
            setAnimation.call(this, "dead", 0, 1);

        return this;
    }

    /**
     * Adds an animation
     * @param {Shattered.Enums.Directions|int} direction The direction of the animation
     * @param {Array.<int>|int} index Array of indeces for that direction
     *        or the first index of the animation.
     * @param {int} [count] If index is the start index, count is the number of frames
     *        in the animation
     * @throws {string} Unknown direction
     * @throws {string} If the index array contains a non-numeric value or a value < 0
     * @throws {string} If index or count are missing, non-numeric, or < 0
     * @returns {Shattered.Objects.SpriteSheet}
     */
    Shattered.Objects.SpriteSheet.prototype.addAnimation = function(name, index, count) {
        setAnimation.call(this, name, index, count);
        return this;
    };

    function setAnimation(name, index, count) {
        if(validateIndexArray(index)) {
            this.animations[name] = index;
        } else {
            validateIndexAndCount(index, count);
            this.animations[name] = [index];
            for(var i= 1; i< count; ++i)
                this.animations[name].push(index + i);
        }
    }

    function validateDirection(direction) {
        switch(direction) {
            case Shattered.Enums.Directions.North:
            case Shattered.Enums.Directions.South:
            case Shattered.Enums.Directions.West:
            case Shattered.Enums.Directions.East:
                break;
            default:
                throw "Unknown Direction " + direction;
        }
        return true;
    }

    function validateIndexArray(index) {
        if(Array.isArray(index)) {
            index.forEach(function(value) {
                if(!Shattered.Utility.isNumeric(value)) {
                    throw "Not all values in index array are numeric: " + value;
                }
                if(value < 0)
                    throw "Not all values in index array are >= 0: " + value;
            });
            return true;
        }
        return false;
    }

    function validateIndexAndCount(index, count) {
        if(!Shattered.Utility.isNumeric(index) || !Shattered.Utility.isNumeric(count))
            throw "Index and Count are required and must be numeric: [index: " + index + " count: " + count + "]";
        if(index < 0 || count < 0)
            throw "Index and Count cannot be < 0: [index: " + index + " count: " + count + "]";
        return true;
    }
})();