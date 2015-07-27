/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @module app
 * @submodule universe
 */
define(function (app) {
  var Cell = require('./cell', app);

  /**
   * @class Universe
   * @constructor
   */
  var Universe = function () {
    this.space = this.createSpace(this.width, this.height);
  };
  Universe.prototype = {
    /**
     * @method toLocaleString
     * @return {Array} of data with alive cells coordinates and step count
     */
    toLocaleString: function () {
      var sync,
          result = {},
          plainSpace = [];
      sync = this.forEachCell(function (cell, x, y) {
        if (cell.isAlive) {
          plainSpace.push({
            x: cell.x,
            y: cell.y
          });
        }
      });
      result.space = plainSpace;
      result.step = gol.step;
      return JSON.stringify(result);
    },

    /**
     * Creates new space
     *
     * @method createSpace
     * @return {Array} new 2d array for cells
     */
    createSpace: function (width, height) {
      var x, y,
          space = [];
      for (x = 0; x < width; x++) {
        space[x] = [];
        for (y = 0; y < height; y++) {
          space[x][y] = new Cell(x, y);
        }
      }
      return space;
    },

    /**
     * Makes some logic from callback function for each cell
     *
     * @method forEachCell
     * @return {Null}
     */
    forEachCell: function (callback) {
      var x, y, cell,
          width = this.width,
          height = this.height,
          space = this.space;
      for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
          cell = space[x][y];
          callback.apply(cell, [cell, x, y]);
        }
      }
      return null;
    },

    /**
     * Universe width
     *
     * @property width
     * @type {Number}
     */
    width: app.config.UNIVERSE_WIDTH,

    /**
     * Universe height
     *
     * @property height
     * @type {Number}
     */
    height: app.config.UNIVERSE_HEIGHT,

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