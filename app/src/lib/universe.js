/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

(function () {
  var GOL = G.app('gameOfLife'),
      Cell = GOL.sandbox.get('Cell');

  GOL.sandbox.add('Universe', function () {
    /**
     * @class Universe
     * @constructor
     */
    var Universe = function () {
      this.width = GOL.config.UNIVERSE_WIDTH;
      this.height = GOL.config.UNIVERSE_HEIGHT;
      this.space = this.createSpace(this.width, this.height);
    };
    Universe.prototype = {
      /**
       * @method toLocaleString
       * @return {Array} Array of data with alive cells coordinates and step count
       */
      toLocaleString: function () {
        var result = {},
            plainSpace = [];
        this.forEachCell(function (cell) {
          if (cell.isAlive) {
            plainSpace.push({
              x: cell.x,
              y: cell.y
            });
          }
        });
        result.space = plainSpace;
        result.step = GOL.module('game').step;
        return JSON.stringify(result);
      },

      /**
       * Creates new space
       *
       * @method createSpace
       * @return {Array} New 2d array for cells
       */
      createSpace: function (width, height) {
        var x, y,
            space = [];
        for (x = 0; x < width; x++) {
          space[x] = [];
          for (y = 0; y < height; y++) {
            space[x][y] = new Cell(x, y, width, height);
          }
        }
        return space;
      },

      /**
       * Makes some logic from callback function for each cell
       *
       * @method forEachCell
       * @param {Universe~ForEachCellCb} callback Callback function for each cell
       */
      forEachCell: function (callback) {
        var x, y, cell,
            width = this.width,
            height = this.height,
            space = this.space;
        for (x = 0; x < width; x++) {
          for (y = 0; y < height; y++) {
            cell = space[x][y];
            callback.call(this, cell);
          }
        }
      },

      /**
       * Called for each cell
       *
       * @callback Universe~ForEachCellCb
       * @param {Cell} cell Cell in universe
       */

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
})();
