/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function (require) {
  var config = require('./config.js');

  /**
   * @class Game
   * @constructor
   */
  var Game = function () {
    var Universe, UI;
    Universe = require('./universe.js');
    UI = require('./ui.js');
    this.universe = new Universe();
    this.ui = new UI(this);
    this.minNeighborsToLive = config.MIN_NEIGHBORS_TO_LIVE;
    this.maxNeighborsToLive = config.MAX_NEIGHBORS_TO_LIVE;
    this.timeInterval = config.TIME_INTERVAL;
    this.neighborsToBeBorn = config.NEIGHBORS_TO_BE_BORN;
    this.step = config.STEP;
    this.stepForward = this.stepForward.bind(this);
    this.forEachCell = this.forEachCell.bind(this);
  };

  Game.prototype = {

    /**
     * Initiates Game Of Life
     *
     * @method init
     */
    init: function () {
      this.ui.appendTo(document.body);
      this.load();
    },

    /**
     * Makes some logic from callback function for each cell
     *
     * @method forEachCell
     * @param {Game~ForEachCellCb} callback Callback function for each cell
     */

    forEachCell: function (callback) {
      var x, y, cell, width, height, space;
      width = this.universe.width;
      height = this.universe.height;
      space = this.universe.space;
      for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
          cell = space[x][y];
          /**
           * Called for each cell
           *
           * @callback Game~ForEachCellCb
           * @param {Cell} cell Cell in canvas
           */
          callback.call(this, cell);
        }
      }
    },

    /**
     * @method toLocaleString
     * @return {Array} Array of data with alive cells coordinates and step count
     */
    toLocaleString: function () {
      var result, plainSpace;
      result = {};
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
      result.step = this.step;
      result = JSON.stringify(result);
      return result;
    },

    /**
     * Starts step continuation
     *
     * @method start
     */
    start: function () {
      if (!this.intervalID) {
        this.intervalID = setInterval(this.stepForward, this.timeInterval);
        this.inAnimation = true;
      }
    },

    /**
     * Stops step continuation
     *
     * @method stop
     */
    stop: function () {
      if (this.intervalID ) {
        clearInterval(this.intervalID);
        this.intervalID = null;
        this.inAnimation = false;
      }
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
      localStorage.setItem(name, this.toLocaleString());
    },

    /**
     * Loads game from LocalStorage
     *
     * @method load
     * @param name {String} Name of game to load
     */
    load: function (name) {
      var data, loadedGame;
      data = name ? localStorage.getItem(name) : require('./default_game.js');
      if (data) {
        loadedGame = JSON.parse(data);
        this.killAllCells();
        this.setStepCounter(loadedGame.step);
        loadedGame.space.forEach(function (cell) {
          this.universe.space[cell.x][cell.y].revive();
        }.bind(this));
        this.render();
      } else {
        throw Error('Could not load game');
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
      var cell = this.universe.space[x][y];
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
      this.ui[key + 'Element'].value = value;
      this.ui[key + 'Element'].parentElement.querySelector('span').innerHTML = value;
      this.conditions[key] = value;
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
        willDie = aliveNeighbors < this.conditions.minNeighborsToLive || aliveNeighbors > this.conditions.maxNeighborsToLive;
        willBeBorn = aliveNeighbors === this.conditions.neighborsToBeBorn;
        if (cell.isAlive) {
          cell.willLiveNextStep = willDie ? false : true;
        } else {
          cell.willLiveNextStep = willBeBorn ? true : false;
        }
      });
    },

    /**
     * @method calculateAliveNeighbors
     * @param cell {Object} Cell around witch alive neighbors will be found
     * @return {Number} count of alive neighbors
     */
    calculateAliveNeighborsOf: function (cell) {
      var space = this.universe.space;
      return cell.neighborsCoordinates
        .map(function (coordinates) {
          return space[coordinates.x][coordinates.y];
        })
        .filter(function (cell) {
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
      this.ui.stepDisplaySpot.innerHTML = value;
    },

    /**
     * Renders game field
     *
     * @method render
     */
    render: function () {
      var x, y, fullCellWidth, fullCellHeight, borderWidth, cellWidth, cellHeight, context;
      fullCellWidth = config.CELL_WIDTH + config.BORDER_WIDTH;
      fullCellHeight = config.CELL_HEIGHT + config.BORDER_WIDTH;
      borderWidth = config.BORDER_WIDTH;
      cellWidth = config.CELL_WIDTH;
      cellHeight = config.CELL_HEIGHT;
      context = this.ui.canvasContext;
      this.forEachCell(function (cell) {
        x = cell.x * fullCellWidth + borderWidth;
        y = cell.y * fullCellHeight + borderWidth;
        cell.calculateColor();
        context.fillStyle = cell.color;
        context.fillRect(x, y, cellWidth, cellHeight);
      });
    },

    /**
     * @property conditions
     * @type Object
     */
    conditions: {
      /**
       * @property minNeighborsToLive
       * @type Number
       * @default 2
       */
      minNeighborsToLive: 2,

      /**
       * @property maxNeighborsToLive
       * @type Number
       * @default 3
       */
      maxNeighborsToLive: 3,

      /**
       * @property neighborsToBeBorn
       * @type Number
       * @default 3
       */
      neighborsToBeBorn: 3
    },


    /**
     * @property timeInterval
     * @type Number
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
    step: 0,

    /**
     * @property inAnimation
     * @type Boolean
     */
    inAnimation: false
  };

  return Game;
});
