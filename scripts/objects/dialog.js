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

/* Dialog box */
Shattered.dialog = function(script, callback) {
    var background = Shattered.Utility.getImage("dialog");
    var font = new me.Font("Verdana", 16, "#eee");

    var dialog_box = new Shattered.Objects.DialogObject(
        // x, y
        30,
        me.video.getHeight() - background.height - 15,

        // Background image.
        background,

        // Text to display.
        script,

        // width, height.
        555,
        71,

        // Text offset x, y.
        12,
        12,

        // Font to display it in.
        font,

        // Which key to watch for.
        Shattered.Enums.Input.Action,

        // What to do when dialog has closed.
        callback
    );
    me.game.add(dialog_box, 1000);
    me.game.sort.defer(me.state.current().sort);
};


/**
 * A simple dialog manager.
 * @class
 * @extends Object
 * @constructor
 * @param {int} x the x coordinates of the dialog box
 * @param {int} y the y coordinates of the dialog box
 * @param {me.loader#getImage} background image
 * @param {array} an array of dialog phrases (strings)
 * @param {int} width of the textbox
 * @param {int} height of the textbox
 * @param {int} x offset of the textbox inside the background image
 * @param {int} y offset of the textbox inside the background image
 * @param {me#Font} the font used to write the dialog
 * @param {String} tag of the key used to pass the dialog pages
 * @param {function} an optional callback function to be called when the dialog is done
 * @example
 * dialog = new DialogObject(10, 10, background, dialog, background.width - OFFSET_SIZE_TEXT_X, background.width - OFFSET_SIZE_TEXT_Y, OFFSET_DIALOG_X, OFFSET_DIALOG_Y, new me.Font("acmesa",20,"#880D0D", "center"), "enter", activateControls);
 */
Shattered.Objects.DialogObject = Object.extend({
    init: function(x, y, background, dialog, widthText, heightText, offsetTextX, offsetTextY, font, tagKey, callback) {
        this.pos = new me.Vector2d(x, y);
        this.background = background;
        this.font = font;
        this.tagKey = tagKey;
        this.widthText = widthText;
        this.heightText = heightText;
        this.rowCount = Math.floor(this.heightText / (this.font.height * 1.1));
        this.offsetTextX = offsetTextX;
        this.offsetTextY = offsetTextY;
        this.dialog = dialog;
        this.counter = 0;
        this.rows = [ this.getWords(this.dialog[0]) ];
        this.currentRow = 0;
        this.callback = callback;
        this.visible = true;
        Shattered.Control.dialog(this);
        this.GUID = me.utils.createGUID();
    },

    getWords: function(text) {
        var totalSize = 0;
        var wordSize = 0;
        var substrings = [];
        var substringsCounter = 0;
        var counter = 0;
        var words = text.split(" ");
        while (typeof(words[counter]) !== 'undefined') {
            wordSize = this.font.measureText(me.video.getScreenFrameBuffer(), words[counter] + " ").width;
            if (counter != 0 && wordSize + totalSize > this.widthText) {
                totalSize = wordSize;
                substringsCounter++;
                substrings[substringsCounter] = words[counter];
            }
            else {
                totalSize += wordSize;
                if (typeof(substrings[substringsCounter]) === 'undefined') {
                    substrings[substringsCounter] = words[counter];
                }
                else {
                    substrings[substringsCounter] += " " + words[counter];
                }
            }
            counter++;
        }
        return substrings;
    },

    update: function() {
        if(!Shattered.Control.updateAllowed(this))
            return false;

        if (me.input.isKeyPressed(this.tagKey)) {
            if (typeof(this.rows[this.counter][this.currentRow + this.rowCount]) !== 'undefined') {
                this.currentRow += this.rowCount;
            }
            else {
                this.currentRow = 0;
                this.counter++;
                if (typeof(this.dialog[this.counter]) === 'undefined') {
                    if (typeof(this.callback) !== 'undefined' && this.callback != null) {
                        this.callback();
                    }
                    me.game.remove.defer(this);
                    Shattered.Control.normal();
                }
                else  {
                    this.rows[this.counter] = this.getWords(this.dialog[this.counter]);
                }
            }
            return true;
        }
        else {
            return false;
        }
    },

    /* -----

    draw the dialog

    ------ */
    draw: function(context) {
        if (typeof(this.dialog[this.counter]) !== 'undefined') {
            // Convert screen coordinates to world coordinates.
            var map_pos = me.game.currentLevel.pos;

            context.drawImage(
                this.background,
                this.pos.x - map_pos.x,
                this.pos.y - map_pos.y
            );
            var offset = 0;
            for (var i = 0; i < this.rowCount; i++) {
                if (typeof(this.rows[this.counter][this.currentRow + i]) !== 'undefined') {
                    this.font.draw(
                        context,
                        this.rows[this.counter][this.currentRow + i],
                        this.pos.x + this.offsetTextX - map_pos.x,
                        this.pos.y + this.offsetTextY - map_pos.y + offset
                    );
                    offset += (this.font.height * 1.1);
                }
            }
        }
    }
});
