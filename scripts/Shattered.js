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

var Shattered = {
    Objects: {
        Entities: {},
        Items: {},
        Library: {}
    },

    Status: {
        wantsResort: false,
        time: 9,
        PlayerMob: null
    },

    init: function() {
        me.sys.gravity = 0;

        me.loader.onload = loaded.bind(this);

        me.video.init( "screen", 640, 480, false, 1.0);
        Shattered.Resources.load();

        function loaded() {
            Shattered.play = new Shattered.Objects.PlayScreen();
            me.state.set(me.state.PLAY, Shattered.play);

            addEntities();

            addInputBindings();

            me.state.change(me.state.PLAY);

            Shattered.Status.AllowUpdates = Shattered.Enums.Updates.Player | Shattered.Enums.Updates.NPC;
            /*
            Shattered.Status.timeTimer = setInterval(function() {
                Shattered.Status.time = (Shattered.Status.time + 1) % 24;
                document.getElementById("time").innerText = Shattered.Status.time;
            }, 5000);
            */
        }

        function addEntities() {
            me.entityPool.add("mob", Shattered.Objects.Entities.Mob);
            me.entityPool.add("chest", Shattered.Objects.Entities.Chest);
        }

        function addInputBindings() {
            me.input.bindKey(me.input.KEY.LEFT,  Shattered.Enums.Input.West);
            me.input.bindKey(me.input.KEY.RIGHT, Shattered.Enums.Input.East);
            me.input.bindKey(me.input.KEY.UP, Shattered.Enums.Input.North);
            me.input.bindKey(me.input.KEY.DOWN, Shattered.Enums.Input.South);
            me.input.bindKey(me.input.KEY.A, Shattered.Enums.Input.Action, true);
            me.input.bindKey(me.input.KEY.SHIFT, Shattered.Enums.Input.Run);

            me.input.registerMouseEvent('mouseup', null, mouseClick, false);
        }

        function mouseClick(e) {
            Shattered.Status.PlayerMob.destination.setDestination(e.pos.x, e.pos.y);
        }
    }
};