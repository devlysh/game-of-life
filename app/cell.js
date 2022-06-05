/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(['./constants/config.js'], function (config) {
    'use strict';

    /**
     * @class Cell
     * @param x {Number} X coordinate of cell
     * @param y {Number} Y coordinate of cell
     * @constructor
     */
    function Cell(x, y) {
        this.x = x;
        this.y = y;
        this.neighborsCoordinates = _detectNeighborsCoordinates.call(this);
    }

    /**
     * Shows if cell is alive
     *
     * @property isAlive
     * @type Boolean
     */
    Cell.prototype.isAlive = false;

    /**
     * Age of alive cell
     *
     * @property age
     * @type Number
     */
    Cell.prototype.age = 0;

    /**
     * Times cell was killed
     *
     * @property deathCount
     * @type Number
     */
    Cell.prototype.deathCount = 0;

    /**
     * Alive neighbors count
     *
     * @property aliveNeighborsCount
     * @type Number
     */
    Cell.prototype.aliveNeighborsCount = 0;

    /**
     * Shows if cell will live next step
     *
     * @property willLiveNextStep
     * @type Boolean
     */
    Cell.prototype.willLiveNextStep = false;

    /**
     * Color of cell
     *
     * @property color
     * @type String
     * @default 'white'
     */
    Cell.prototype.color = '';

    /**
     * X coordinate of cell
     *
     * @property x
     * @type Number
     */
    Cell.prototype.x = 0;

    /**
     * Y coordinate of cell
     *
     * @property y
     * @type Number
     */
    Cell.prototype.y = 0;

    /**
     * @property neighborsCoordinates
     * @type Array
     */
    Cell.prototype.neighborsCoordinates = [];

    /**
     * Revives cell
     *
     * @method revive
     */
    Cell.prototype.revive = revive;
    function revive() {
        if (!this.isAlive) {
            this.isAlive = true;
        }
    }

    /**
     * Kills cell
     *
     * @method kill
     */
    Cell.prototype.kill = kill;
    function kill() {
        if (this.isAlive) {
            this.isAlive = false;
        }
    }

    /**
     * Calculates color of cell
     *
     * @method calculateColor
     */
    Cell.prototype.calculateColor = calculateColor;
    function calculateColor() {
        //TODO: Implement colorful game
        this.color = this.isAlive ? config.ALIVE_COLOR : config.DEAD_COLOR;
    }

    /**
     * @method _detectNeighborsCoordinates
     * @private
     * @return {Array} cells which are neighbors to current cell
     */
    function _detectNeighborsCoordinates() {
        var x = this.x,
            y = this.y,
            MIN_X = 0,
            MIN_Y = 0,
            MAX_X = config.UNIVERSE_WIDTH - 1,
            MAX_Y = config.UNIVERSE_HEIGHT - 1,
            data = [];
        if (x - 1 >= MIN_X && y - 1 >= MIN_Y) {
            data.push({x: x - 1, y: y - 1});
        }
        if (x + 1 <= MAX_X && y - 1 >= MIN_Y) {
            data.push({x: x + 1, y: y - 1});
        }
        if (x + 1 <= MAX_X && y + 1 <= MAX_Y) {
            data.push({x: x + 1, y: y + 1});
        }
        if (x - 1 >= MIN_X && y + 1 <= MAX_Y) {
            data.push({x: x - 1, y: y + 1});
        }
        if (y - 1 >= MIN_Y) {
            data.push({x: x, y: y - 1});
        }
        if (x + 1 <= MAX_X) {
            data.push({x: x + 1, y: y});
        }
        if (y + 1 <= MAX_Y) {
            data.push({x: x, y: y + 1});
        }
        if (x - 1 >= MIN_X) {
            data.push({x: x - 1, y: y});
        }
        return data;
    }

    return Cell;
});
