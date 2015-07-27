/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @module app
 * @submodule cell
 */
define(function () {
  /**
   * @class Cell
   * @param x {Number} X coordinate of cell
   * @param y {Number} Y coordinate of cell
   * @constructor
   */
  var Cell = function (x, y) {
    this.x = x;
    this.y = y;
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
      // TODO: Rewrite this method.
      //
      // var r , g, b, deathCount, aliveMulti, deadMulti;
      // if (this.isAlive) {
      //   aliveMulti = this.age * app.config.AGE_COLOR_MULTIPLYER + this.aliveNeighborsCount * app.config.ALIVE_NEIGHBORS_COLOR_MULTIPLYER;
      //   r = 0;
      //   g = b = aliveMulti < app.config.ALIVE_MULTI_COLOR_THRESHOLD ? aliveMulti : app.config.ALIVE_MULTI_COLOR_THRESHOLD;
      //   this.color = this.age === 0 ? app.config.ALIVE_COLOR : 'rgb(' + r + ',' + g + ',' + b + ')';
      // } else {
      //   deathCount = Math.floor(this.deathCount);
      //   deadMulti = deathCount * app.config.DEAD_COLOR_MULTIPLYER;
      //   r = 255;
      //   g = b = deadMulti < app.config.DEAD_MULTI_COLOR_THRESHOLD ? app.config.DEAD_MULTI_COLOR_THRESHOLD - deadMulti : 0;
      //   this.color = deadMulti === 0 ? app.config.DEAD_COLOR : 'rgb(' + r + ',' + g + ',' + b + ')';
      // }
      //

      this.color = this.isAlive ? 'black' : 'white';
    },

    /**
     * @method findCellsAround
     * @return {Array} cells which are neighbors to current cell;
     */
    findCellsAround: function () {
      var MIN_X = 0,
          MIN_Y = 0,
          MAX_X = app.universe.width-1,
          MAX_Y = app.universe.height-1,
          space = app.universe.space,
          x = this.x,
          y = this.y,
          cellsAround = [];
      if (x-1 >= MIN_X && y-1 >= MIN_Y ) { cellsAround.push(space[x-1][y-1]); }
      if (x+1 <= MAX_X && y-1 >= MIN_Y ) { cellsAround.push(space[x+1][y-1]); }
      if (x+1 <= MAX_X && y+1 <= MAX_Y ) { cellsAround.push(space[x+1][y+1]); }
      if (x-1 >= MIN_X && y+1 <= MAX_Y ) { cellsAround.push(space[x-1][y+1]); }
      if (y-1 >= MIN_Y ) { cellsAround.push(space[x][y-1]); }
      if (x+1 <= MAX_X ) { cellsAround.push(space[x+1][y]); }
      if (y+1 <= MAX_Y ) { cellsAround.push(space[x][y+1]); }
      if (x-1 >= MIN_X ) { cellsAround.push(space[x-1][y]); }
      return cellsAround;
    },

    /**
     * @method calculateAliveNeighbors
     * @return {Number} count of alive neighbors
     */
    calculateAliveNeighbors: function () {
      return this.findCellsAround()
        .filter(function(cell) {
          return cell.isAlive;
        })
        .length;
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
    color: null,

    /**
     * X coordinate of cell
     *
     * @property x
     * @type Number
     */
    x: null,

    /**
     * Y coordinate of cell
     *
     * @property y
     * @type Number
     */
    y: null
  };

  return Cell;
});
