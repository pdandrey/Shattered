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

Shattered.Objects.Stats = (function() {
    var stats = {
        Strength: 		{ Name: 'Strength',     Maximum: 25,    Minimum: 1 },
        Agility: 		{ Name: 'Agility',      Maximum: 25,    Minimum: 1 },
        Vitality: 		{ Name: 'Vitality',     Maximum: 25,    Minimum: 1 },
        Intelligence: 	{ Name: 'Intelligence', Maximum: 25,    Minimum: 1 },
        Mind: 			{ Name: 'Mind',         Maximum: 25,    Minimum: 1 },
        Charisma: 		{ Name: 'Charisma',     Maximum: 25,    Minimum: 1 },
        Speed: 			{ Name: 'Speed',        Maximum: 50,    Minimum: 10 },
        Range: 			{ Name: 'Range',        Maximum: 10,    Minimum: 1 }
    };

    function setStat(key, value, values, allowOver) {
        if(value < stats[key].Minimum)
            throw key + " " + value + " is below the minimum of " + stats[key].Minimum;
        if(!allowOver && value > stats[key].Maximum)
            throw key + " " + value + " is above the maximum of " + stats[key].Maximum;
        values[key] = value;
    }

    for(var key in stats) {
        stats[key].get = (function() { var k = key; return function() { return this._values[k]; } })();
        stats[key].set = (function() { var k = key; return function(newValue) { setStat(k, newValue, this._values, this.allowOver); }})();
    }

    var Stats = function(allowOver) {
        var values = {};

        for(var s in stats) {
            values[s] = stats[s].Minimum;
        }

        if(!allowOver)
            allowOver = false;

        Object.defineProperties(this, {
            "_values": { enumerable: false, value: values, writable: false },
            AllowOver: { enumerable: true, value: allowOver, writable: false },
            "Strength": { enumerable: true, get: stats.Strength.get, set: stats.Strength.set },
            "Agility": { enumerable: true, get: stats.Agility.get, set: stats.Agility.set },
            "Vitality": { enumerable: true, get: stats.Vitality.get, set: stats.Vitality.set },
            "Intelligence": { enumerable: true, get: stats.Intelligence.get, set: stats.Intelligence.set },
            "Mind": { enumerable: true, get: stats.Mind.get, set: stats.Mind.set },
            "Charisma": { enumerable: true, get: stats.Charisma.get, set: stats.Charisma.set },
            "Speed": { enumerable: true, get: stats.Speed.get, set: stats.Speed.set },
            "Range": { enumerable: true, get: stats.Range.get, set: stats.Range.set }
        });
    };

    Stats.prototype.toString = function() {
        var ret = "";
        for(var s in stats) {
            ret += s + ": " + this[s] + "\n";
        }
        return ret;
    };

    Stats.CopyFrom = function(stat, allowOver) {
        var newStat = new Stats(allowOver);
        for(var s in stat) {
            newStat[s] = stat[s];
        }
        return newStat;
    };

    return Stats;
})();