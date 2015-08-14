/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

(function () {
  var gol = G.app('gameOfLife'),
      fullCellWidth = gol.config.CELL_WIDTH + gol.config.BORDER_WIDTH,
      fullCellHeight = gol.config.CELL_HEIGHT + gol.config.BORDER_WIDTH,
      borderWidth = gol.config.BORDER_WIDTH,
      cellWidth = gol.config.CELL_WIDTH,
      cellHeight = gol.config.CELL_HEIGHT;

  /**
   * @class Game
   * @constructor
   */
  var Game = function () {
    this.minNeighborsToLive = gol.config.MIN_NEIGHBORS_TO_LIVE;
    this.maxNeighborsToLive = gol.config.MAX_NEIGHBORS_TO_LIVE;
    this.neighborsToBeBorn = gol.config.NEIGHBORS_TO_BE_BORN;
    this.timeInterval = gol.config.TIME_INTERVAL;
    this.step = gol.config.STEP;
  };
  
  Game.prototype = {
    /**
     * Makes some logic from callback function for each cell
     *
     * @method forEachCell
     * @param {Universe~ForEachCellCb} callback Callback function for each cell
     */
    forEachCell: function (callback) {
      var x, y, cell,
          width = gol.module('universe').width,
          height = gol.module('universe').height,
          space = gol.module('universe').space;
      for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
          cell = space[x][y];
          callback.call(this, cell);
        }
      }
    },

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
      result.step = gol.module('game').step;
      return JSON.stringify(result);
    },

    /**
     * Initiates Game Of Life
     *
     * @method init
     */
    init: function () {
      var savedGame = localStorage.getItem('savedGame');
      gol.module('ui').appendTo(document.getElementById('zero'));
      if (savedGame) {
        this.load();
      } else {
        window.localStorage.setItem('defaultGame', gol.sandbox.get('defaultGame'));
        this.load('defaultGame');
      }
    },

    /**
     * Starts step continuation
     *
     * @method start
     */
    start: function () {
      if (!this.intervalID) {
        this.intervalID = window.setInterval(this.stepForward.bind(this), this.timeInterval);
      }
    },

    /**
     * Stops step continuation
     *
     * @method stop
     */
    stop: function () {
      window.clearInterval(this.intervalID);
      this.intervalID = null;
    },

    /**
     * Kills, revives cells and sets counters
     *
     * @method stepForward
     */
    stepForward: function () {
      this.calculateNextStep();
      this.forEachCell(function (cell) {
        if (!cell.isAlive && cell.willLiveNextStep) {
          cell.revive();
        } else if (cell.isAlive && !cell.willLiveNextStep) {
          cell.kill();
        }
      });
      this.setStepCounter(this.step + 1);
      this.render();
    },

    /**
     * Saves game to LocalStorage
     *
     * @method save
     */
    save: function (name) {
      name = name || 'savedGame';
      localStorage.setItem(name, gol.module('universe').toLocaleString());
    },

    /**
     * Loads game from LocalStorage
     *
     * @method load
     * @param name {String} Name of game to load
     */
    load: function (name) {
      var data, loadedGame;
      name = name || 'savedGame';
      data = window.localStorage.getItem(name);
      if (data) {
        loadedGame = JSON.parse(data);
        this.killAllCells();
        this.setStepCounter(loadedGame.step);
        loadedGame.space.forEach(function (cell) {
          gol.module('universe').space[cell.x][cell.y].revive();
        }.bind(this));
        this.render();
      }
    },

    /**
     * Toggles cell from alive to dead or inside out
     *
     * @method toggleCell
     * @param x {Number} X coordinate of cell
     * @param y {Number} Y coordinate of cell
     */
    toggleCell: function (x, y) {
      var cell = gol.module('universe').space[x][y];
      if (cell.isAlive) {
        cell.kill();
      } else {
        cell.revive();
      }
      this.calculateNextStep();
      this.render();
    },

    /**
     * Kills all cells, updated counter, commits render
     *
     * @method killAllCells
     */
    killAllCells: function () {
      this.forEachCell(function (cell) {
        cell.kill();
        cell.willLiveNextStep = null;
      });
      this.setStepCounter(0);
      this.render();
    },

    /**
     * Changes life conditions
     *
     * @method changeLifeConditions
     * @param key {String} Condition to change
     * @param value {Number} Value of changed condition
     */
    changeLifeConditions: function (key, value) {
      gol.module('ui')[key + 'Element'].value = value;
      gol.module('ui')[key + 'Element'].parentElement.querySelector('span').innerHTML = value;
      this[key] = value;
      this.calculateNextStep();
    },

    /**
     * Sets property 'willLiveNextStep' of each cell accordingly to life conditions
     *
     * @method calculateNextStep
     */
    calculateNextStep: function () {
      var aliveNeighbors, willDie, willBeBorn;
      this.forEachCell(function (cell) {
        aliveNeighbors = this.calculateAliveNeighborsOf(cell);
        willDie = aliveNeighbors < this.minNeighborsToLive || aliveNeighbors > this.maxNeighborsToLive;
        willBeBorn = aliveNeighbors === this.neighborsToBeBorn;
        if (cell.isAlive) {
          cell.willLiveNextStep = willDie ? false : true;
        } else {
          cell.willLiveNextStep = willBeBorn ? true : false;
        }
      }.bind(this));
    },

    /**
     * @method calculateAliveNeighbors
     * @param cell {Object} Cell around witch alive neighbors will be found
     * @return {Number} count of alive neighbors
     */
    calculateAliveNeighborsOf: function (cell) {
      var space = gol.module('universe').space;
      return cell.neighborsCoordinates
          .map(function (coordinates) {
            return space[coordinates.x][coordinates.y];
          })
          .filter(function(cell) {
            return cell.isAlive;
          })
          .length;
    },

    /**
     * Sets step counter value
     *
     * @method setStepCounter
     * @param value {Number} Sets given value to DOM element
     */
    setStepCounter: function (value) {
      this.step = value;
      gol.module('ui').stepDisplayElement.innerHTML = value;
    },

    /**
     * Renders game field
     *
     * @method render
     */
    render: function () {
      var x, y,
          context = gol.module('ui').universeContext;
      this.forEachCell(function (cell) {
        x = cell.x * fullCellWidth + borderWidth;
        y = cell.y * fullCellHeight + borderWidth;
        cell.calculateColor();
        context.fillStyle = cell.color;
        context.fillRect(x, y, cellWidth, cellHeight);
      });
    },

    /**
     * @property minNeighborsToLive
     * @type Number
     * @default 2
     */
    minNeighborsToLive: 2,

    /**
     * @property mmaxNeighborsToLive
     * @type Number
     * @default 3
     */
    maxNeighborsToLive: 3,

    /**
     * @property neighborsToBeBorn
     * @type Number
     * @default 3
     */
    neighborsToBeBorn: 3,

    /**
     * @property timeInterval
     * @type Number
     * @default 40
     */
    timeInterval: 0,

    /**
     * @property intervalID
     * @type Number
     */
    intervalID: 0,

    /**
     * @property step
     * @type Number
     */
    step: 0
  };

  gol.sandbox.add('Game', Game);
})();
