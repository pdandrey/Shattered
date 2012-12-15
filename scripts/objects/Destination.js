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

    var walk_angle = Math.sin((45).degToRad());

    /**
     * Controls the pathing for {Shattered.Objects.Entities.Mob}
     * @param {Shattered.Objects.Entities.Mob} mob The mob that owns this destination
     * @param {object} [pathData] Object containing the predefined path for the mob
     * @param {object[]} pathData.path Array of {x,y} coordinates to follow
     * @param {boolean} [pathData.repeat=true] Should the path loop? (return to starting position after path[last])
     * @param {function} [pathData.callback] Callback when the final point is reached.
     * @constructor
     */
    Shattered.Objects.Destination = function(mob, pathData) {
        this._mob = mob;
        this._destination = null;
        if(pathData) {
            if(!Array.isArray(pathData.path))
                throw "pathData.path must be an array";
            for(var i=pathData.length-1; i>=0; --i) {
                if(pathData[i].x == null || pathData[i].y == null)
                    throw "pathData[" + i + "] is not correctly formed.";
            }
            if(pathData.repeat == null)
                pathData.repeat = true;
            if(pathData.repeat) {
                pathData.path = [{x: mob.body.p.x, y: Shattered.Utility.getHeight() - mob.body.p.y }].concat(pathData.path);
                pathData._idx = 1;
            } else {
                pathData._idx = 0;
            }
        }
        this._pathData = pathData || null;
    };

    Shattered.Objects.Destination.prototype.isDestinationReached = function() {
        if(!this._destination)
            return true;
        var x = this._mob.body.p.x;
        var y = Shattered.Utility.getHeight() - this._mob.body.p.y;
        return Math.abs(this._destination.x - x) < this._mob.destTolerance
            && Math.abs(this._destination.y - y) < this._mob.destTolerance;
    };

    Shattered.Objects.Destination.prototype.getForce = function() {
        var velocity = this._mob.velocity;
        var force = { x: 0, y: 0 };
        var moveForce = velocity * me.timer.tick;

        if(!this.isDestinationReached()) {
            // move towards the destination
            var x = this._mob.body.p.x;
            var y = me.video.getHeight() - this._mob.body.p.y;

            force.x = (this._destination.x - x).clamp(-1, 1) * moveForce;
            force.y = (this._destination.y - y).clamp(-1, 1) * moveForce;
        }

        if(this._mob.playerControlled) {
            // is there player input?
            var playerInput = false;
            if(me.input.isKeyPressed(Shattered.Enums.Input.North)) {
                playerInput = true;
                force.y -= moveForce;
            }
            if(me.input.isKeyPressed(Shattered.Enums.Input.South)) {
                playerInput = true;
                force.y += moveForce;
            }
            if(me.input.isKeyPressed(Shattered.Enums.Input.East)) {
                playerInput = true;
                force.x += moveForce;
            }
            if(me.input.isKeyPressed(Shattered.Enums.Input.West)) {
                playerInput = true;
                force.x -= moveForce;
            }
            if(playerInput) {
                this.clear();
                if (me.input.keyStatus(Shattered.Enums.Input.Run)) {
                    // Run.
                    force.x *= 2;
                    force.y *= 2;
                    this._mob.animationspeed = 3;
                }
                else {
                    // Walk.
                    this._mob.animationspeed = 6;
                }
            }
        }

        if(force.x && force.y) {
            // diagonal move, slow down a little
            force.x *= walk_angle;
            force.y *= walk_angle;
        }

        return force;
    };

    Shattered.Objects.Destination.prototype.clear = function () {
        this._destination = null;
    };

    Shattered.Objects.Destination.prototype.next = function() {

        if(this._pathData) {
            if(this._destination && !this.isDestinationReached()) {
                console.warn("Attempted to move to next pathed destination before current destination has been reached: %o", this);
                return;
            }

            var nextDest = this._pathData[this._pathData.idx];
            this._destination = new cp.v(nextDest.x, nextDest.y);
            ++this._pathData._idx;
            if(this._pathData._idx >= this._pathData.path) {
                if(this._pathData.callback)
                    this._pathData.callback();
                if(this._pathData.repeat)
                    this._pathData._idx = 0;
            }
        } else {
            // random destination

            if(this._destination) {
                //console.warn("Attempted to move to next random destination before current destination has been reached: %o", this);
                return;
            }

            var x = this._mob.body.p.x;
            var y = me.video.getHeight() - this._mob.body.p.y;

            var max = this._mob.maxDistance * 2;
            var hMax = this._mob.maxDistance;

            this._destination = new cp.v(x + ~~(Math.random() * max - hMax), y + ~~(Math.random() * max - hMax));
        }
    };

    Shattered.Objects.Destination.prototype.draw = function(context, x, y) {
        if(this._destination) {
            var viewport = me.game.viewport.pos;
            context.save();
            context.strokeStyle = "red";
            context.moveTo(this._mob.body.p.x - viewport.x, Shattered.Utility.getHeight() - this._mob.body.p.y - viewport.y);
            context.lineTo(this._destination.x - viewport.x, this._destination.y - viewport.y);
            context.stroke();
            context.restore();
        }
    }

    Shattered.Objects.Destination.prototype.setDestination = function(x, y) {
        this._destination = new cp.v(x, y);
    }

})();