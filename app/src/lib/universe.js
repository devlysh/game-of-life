/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function (require) {
  var config = require('./config.js');

  /**
   * @class Universe
   * @constructor
   */
  var Universe = function () {
    this.width = config.UNIVERSE_WIDTH;
    this.height = config.UNIVERSE_HEIGHT;
    this.space = this._createSpace(this.width, this.height);
  };

  Universe.prototype = {

    /**
     * Creates new space
     *
     * @method _createSpace
     * @return {Array} New 2d array for cells
     */
    _createSpace: function (width, height) {
      var x, y, space, Cell;
      space = [];
      Cell = require('./cell.js');
      for (x = 0; x < width; x++) {
        space[x] = [];
        for (y = 0; y < height; y++) {
          space[x][y] = new Cell(x, y);
        }
      }
      return space;
    },

    /**
     * Universe width
     *
     * @property width
     * @type {Number}
     */
    width: null,

    /**
     * Universe height
     *
     * @property height
     * @type {Number}
     */
    height: null,

    /**
     * Space is 2d array with cells
     *
     * @property space
     * @type {Array}
     */
    space: null
  };

  return Universe;
});
