/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

(function () {
  var gol = G.app('gameOfLife'),
      Cell = gol.sandbox.get('Cell');

  /**
   * @class Universe
   * @constructor
   */
  var Universe = function () {
    this.width = gol.config.UNIVERSE_WIDTH;
    this.height = gol.config.UNIVERSE_HEIGHT;
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

  gol.sandbox.add('Universe', Universe);
})();
