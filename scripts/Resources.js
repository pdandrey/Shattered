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

Shattered.Resources = (function() {

    /** @enum {int} */
    var ResourceTypes = {
        Image: 1,
        Sprite: 2,
        Map: 3,
        Tiles: 4
    };

    function getImages() {
        return [
            new ResourceItem("dialog", ResourceTypes.Image)
        ];
    }

    var spritesheets = null;
    function getSprites() {

        spritesheets = {};
        var sprites = [];

        var d = Shattered.Enums.Directions;

        sprites.push(new ResourceItem("princess", ResourceTypes.Sprite));
        sprites.push(new ResourceItem("female_greendress", ResourceTypes.Sprite));
        sprites.push(new ResourceItem("sword", ResourceTypes.Sprite, "sword_sheet"));
        sprites.push(new ResourceItem("chests", ResourceTypes.Sprite));

        spritesheets["female_greendress"] =
        spritesheets["princess"] =  new Shattered.Objects.SpriteSheet(64, 64)
            .addWalkAnimation(d.North, 0, 8)
            .addWalkAnimation(d.West, 9, 8)
            .addWalkAnimation(d.South, 18, 8)
            .addWalkAnimation(d.East, 27, 8)
            .addSlashAnimation(d.North, 36, 6)
            .addSlashAnimation(d.West, 45, 6)
            .addSlashAnimation(d.South, 54, 6)
            .addSlashAnimation(d.East, 63, 6)
            .addCastAnimation(d.North, 72, 7)
            .addCastAnimation(d.West, 81, 7)
            .addCastAnimation(d.South, 90, 7)
            .addCastAnimation(d.East, 99, 7)
            .addDeathAnimation(108, 6);

        spritesheets["sword"] = new Shattered.Objects.SpriteSheet(128, 128)
            .addSlashAnimation(d.North, 0, 6)
            .addSlashAnimation(d.West, 6, 6)
            .addSlashAnimation(d.South, 12, 6)
            .addSlashAnimation(d.East, 18, 6)
        ;

        spritesheets["chests"] = new Shattered.Objects.SpriteSheet(32, 32)
            //.addAnimation("square_closed", [0])
            //.addAnimation("square_open", [4])
            .addAnimation("square", [0,2,4])
            //.addAnimation("rounded_closed", [1])
            //.addAnimation("rounded_open", [5])
            .addAnimation("rounded", [1,3,5])
        ;
        return sprites;
    }

    function getMaps() {
        return [
            new ResourceItem("test", ResourceTypes.Map),
            new ResourceItem("animwater", ResourceTypes.Tiles),
            new ResourceItem("grass", ResourceTypes.Tiles),
            new ResourceItem("sandwater", ResourceTypes.Tiles),
            new ResourceItem("treetop", ResourceTypes.Tiles),
            new ResourceItem("trunk", ResourceTypes.Tiles)
        ];
    }

    /**
     * @param {string} name The name of the resource
     * @param {ResourceTypes|int} type The type of the resource
     * @param {string} [filename] File name of the resource (if it differs from the name)
     * @constructor
     * @throws {string} Exception if type is not known
     */
    function ResourceItem(name, type, filename) {
        this.name = name;
        var ext = null;
        var dir = "resources/";

        switch(type) {
            case ResourceTypes.Image:
                this.type = "image";
                ext = ".png";
                dir += "images/";
                break;

            case ResourceTypes.Sprite:
                this.type = "image";
                ext = ".png";
                dir += "sprites/";
                break;

            case ResourceTypes.Map:
                this.type = "tmx";
                ext = ".tmx";
                dir += "maps/";
                break;

            case ResourceTypes.Tiles:
                this.type = "image";
                ext = ".png";
                dir += "tiles/";
                break;

            default:
                throw "Unknown resource type " + type;
        }

        this.src = dir + (filename || name) + ext;
    }

    /**
     * Preloads the resources
     */
    function load() {
        var resources = getSprites().concat(getMaps(), getImages());
        me.loader.preload(resources);
    }

    return {
        load: load,
        /**
         * Returns the SpriteSheet for the given name
         * @param name The name of the spritesheet
         * @return {Shattered.Objects.SpriteSheet}
         */
        getSpriteSheet: function(name) { return spritesheets[name.toLowerCase()]; }
    }
})();