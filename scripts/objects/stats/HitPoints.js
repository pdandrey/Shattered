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

Shattered.Objects.HitPoints = (function() {

    function setMax(newMax) {
        this._current = Math.min(newMax, this._current);
        this._max = newMax;
    }

    function getMax() { return this._max; }

    function getCurrent() { return this._current; }

    function isDead() { return this._current < 0; }

    function isBloodied() { return this._current <= ~~(this._max / 2); }

    function HitPoints(max, current) {

        if(current == null)
            current = max;

        this._current = current;
        this._max = max;

        Object.defineProperties(this, {
            isBloodied: { get: isBloodied, enumerable: true },
            isDead: { get: isDead, enumerable: true },
            max: { get: getMax, set: setMax, enumerable: true },
            current: { get: getCurrent, enumerable: true }
        });

    }

    HitPoints.prototype.heal = function(healing) {
        if(healing > 0)
            this._current = Math.min(this._max, Math.max(0, this._current) + healing);
        return this.isDead;
    };

    HitPoints.prototype.damage = function(damage) {
        if(damage > 0)
            this._current -= damage;
        return this.isDead;
    };

    return HitPoints;
})();