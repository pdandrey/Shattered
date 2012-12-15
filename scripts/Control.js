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

Shattered.Control = (function() {

    var MODES = { Normal: 1, Battle: 2, Modal: 3 };

    var disabled = [];
    var enabled = [];
    var mode = MODES.Normal;

    function updatedAllowed(item) {
        if(disabled.indexOf(item) !== -1)
            return false;
        if(enabled.indexOf(item) !== -1)
            return true;

        switch(mode) {
            case MODES.Normal:
                return true;

            case MODES.Battle:
                throw "Cannot handle battle mode yet";

            case MODES.Modal:
                return false;

            default:
                throw "Unknown mode";
        }
    }

    function normal() {
        disabled.length = enabled.length = 0;
        mode = MODES.Normal;
    }

    function battle() {
        throw "Cannot enter battle mode yet";
    }

    function modal(dialog) {
        enabled.push(dialog);
        mode = MODES.Modal;
    }

    function dialog(dialog) {
        console.log("dialog control for %o", Shattered.Status.PlayerMob);
        disabled.push(Shattered.Status.PlayerMob, Shattered.Status.PlayerMob.target);
        enabled.push(dialog);
    }

    var ret = {
        normal: normal,
        battle: battle,
        modal: modal,
        dialog: dialog,
        updateAllowed: updatedAllowed
    };

    return ret;
})();