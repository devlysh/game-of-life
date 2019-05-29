/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(['./config.js', './cell.js'], function (config, Cell) {
    'use strict';

    /**
     * @class Universe
     * @constructor
     */
    function Universe() {
        this.width = config.UNIVERSE_WIDTH;
        this.height = config.UNIVERSE_HEIGHT;
        this.space = _createSpace(this.width, this.height);
    }

    /**
     * Universe width
     *
     * @property width
     * @type {Number}
     */
    Universe.prototype.width = null;

    /**
     * Universe height
     *
     * @property height
     * @type {Number}
     */
    Universe.prototype.height = null;

    /**
     * Space is 2d array with cells
     *
     * @property space
     * @type {Array}
     */
    Universe.prototype.space = null;

    /**
     * Creates new space
     *
     * @method _createSpace
     * @private
     * @return {Array} New 2d array for cells
     */
    function _createSpace(width, height) {
        var x, y,
            space = [];
        for (x = 0; x < width; x++) {
            space[x] = [];
            for (y = 0; y < height; y++) {
                space[x][y] = new Cell(x, y);
            }
        }
        return space;
    }

    return Universe;
});
