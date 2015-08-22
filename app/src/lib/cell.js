/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function (require) {
  var config = require('./config.js');

  /**
   * @class Cell
   * @param x {Number} X coordinate of cell
   * @param y {Number} Y coordinate of cell
   * @constructor
   */
  var Cell = function (x, y) {
    var universeWidth, universeHeight;
    universeWidth = config.UNIVERSE_WIDTH;
    universeHeight = config.UNIVERSE_HEIGHT;
    this.x = x;
    this.y = y;
    this.neighborsCoordinates = this.detectNeighborsCoordinates(x, y, universeWidth - 1, universeHeight - 1);
  };

  Cell.prototype = {
    /**
     * Revives cell
     *
     * @method revive
     */
    revive: function () {
      if (!this.isAlive) {
        this.isAlive = true;
      }
    },

    /**
     * Kills cell
     *
     * @method kill
     */
    kill: function () {
      if (this.isAlive) {
        this.isAlive = false;
      }
    },

    /**
     * Calculates color of cell
     *
     * @method calculateColor
     */
    calculateColor: function () {
      this.color = this.isAlive ? 'black' : 'white';
    },

    /**
     * @method detectNeighborsCoordinates
     * @param {Number} x X coordinate of the cell
     * @param {Number} y Y coordinate of the cell
     * @param {Number} maxX Maximum available X coordinate in the universe
     * @param {Number} maxY Maximum available Y coordinate in the universe
     * @return {Array} cells which are neighbors to current cell
     */
    detectNeighborsCoordinates: function (x, y, maxX, maxY) {
      var MIN_X = 0,
        MIN_Y = 0,
        MAX_X = maxX,
        MAX_Y = maxY,
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
    },

    /**
     * Shows if cell is alive
     *
     * @property isAlive
     * @type Boolean
     */
    isAlive: false,

    /**
     * Age of alive cell
     *
     * @property age
     * @type Number
     */
    age: 0,

    /**
     * Times cell was killed
     *
     * @property deathCount
     * @type Number
     */
    deathCount: 0,

    /**
     * Alive neighbors count
     *
     * @property aliveNeighborsCount
     * @type Number
     */
    aliveNeighborsCount: 0,

    /**
     * Shows if cell will live next step
     *
     * @property willLiveNextStep
     * @type Boolean
     */
    willLiveNextStep: false,

    /**
     * Color of cell
     *
     * @property color
     * @type String
     * @default 'white'
     */
    color: '',

    /**
     * X coordinate of cell
     *
     * @property x
     * @type Number
     */
    x: 0,

    /**
     * Y coordinate of cell
     *
     * @property y
     * @type Number
     */
    y: 0,

    /**
     * @property neighborsCoordinates
     * @type Array
     */
    neighborsCoordinates: []
  };

  return Cell;
});
