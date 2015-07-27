/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @module app
 * @submodule gol
 */
define(function (app) {
  /**
   * @class GOL
   * @constructor
   */
  var GOL = function () {};
  GOL.prototype = {
    /**
     * Initiates Game Of Life
     *
     * @method init
     */
    init: function () {
      var savedGame = localStorage.getItem('savedGame');
      app.ui.appendTo(document.getElementById('zero'));
      if (savedGame) {
        this.load();
      } else {
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
      var sync;
      window.cancelAnimationFrame(this.rAFID);
      this.calculateNextStep();
      sync = app.universe.forEachCell(function (cell) {
        if (!cell.isAlive && cell.willLiveNextStep) {
          cell.revive();
        } else if (cell.isAlive && cell.willLiveNextStep) {
          cell.age++;
        } else if (!cell.isAlive && !cell.willLiveNextStep) {
          cell.deathCount -= cell.deathCount > app.config.DEATH_COUNT_WITHRAW ? app.config.DEATH_COUNT_WITHRAW : 0;
        } else if (cell.isAlive && !cell.willLiveNextStep) {
          cell.kill();
          this.deathCount++;
          cell.age = 0;
        }
      });
      this.rAFID = window.requestAnimationFrame(this.rAFStep.bind(this));
      this.setStepCounter(this.step + 1);
    },

    /**
     * Commits rendering for next frame
     *
     * @method rAFStep
     */
    rAFStep: function () {
      this.render();
    },

    /**
     * Saves game to LocalStorage
     *
     * @method save
     */
    save: function (name) {
      name = name || 'savedGame';
      localStorage.setItem(name, this.universe.toLocaleString());
    },

    /**
     * Loads game from LocalStorage
     *
     * @method load
     * @param {String} name of game to load
     */
    load: function (name) {
      var data, loadedGame, sync;
      name = name || 'savedGame';
      data = require('./default_game');
      if (data) {
        loadedGame = JSON.parse(data);
        this.killAllCells();
        this.setStepCounter(loadedGame.step);
        sync = loadedGame.space.forEach(function (cell) {
          app.universe.space[cell.x][cell.y].revive();
        }.bind(this));
        this.render();
      }
    },

    /**
     * Toggles cell from alive to dead or inside out
     *
     * @method toggleCell
     * @param {Number} x coordinate of cell
     * @param {Number} y coordinate of cell
     */
    toggleCell: function (x, y) {
      var cell = app.universe.space[x][y];
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
      app.universe.forEachCell(function (cell) {
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
     * @param {String} key condition to change
     * @param {Number} value for changed condition
     */
    changeLifeConditions: function (key, value) {
      app.ui[key + 'Element'].value = value;
      app.ui[key + 'Element'].parentElement.querySelector('span').innerHTML = value;
      this[key] = value;
      this.calculateNextStep();
    },

    /**
     * Sets property 'willLiveNextStep' of each cell accordingly to life conditions
     *
     * @method calculateNextStep
     */
    calculateNextStep: function () {
      var aliveNeighbors;
      app.universe.forEachCell(function (cell) {
        aliveNeighbors = cell.calculateAliveNeighbors();
        if (cell.isAlive) {
          if (aliveNeighbors < this.minNeighborsToLive || aliveNeighbors > this.maxNeighborsToLive) {
            cell.willLiveNextStep = false;
          } else {
            cell.willLiveNextStep = true;
          }
        } else {
          if (aliveNeighbors === this.neighborsToBeBorn) {
            cell.willLiveNextStep = true;
          } else {
            cell.willLiveNextStep = false;
          }
        }
      }.bind(this));
    },

    /**
     * Sets step counter value
     *
     * @method setStepCounter
     * @param {Number} value to set
     */
    setStepCounter: function (value) {
      if (typeof value === 'number') {
        this.step = value;
      } else if (typeof value === 'undefined') {
        value = this.step;
      }
      app.ui.stepDisplayElement.innerHTML = value;
    },

    /**
     * Renders game field
     *
     * @method render
     */
    render: function () {
      var x, y,
          context = app.ui.universeContext,
          fullCellWidth = app.config.CELL_WIDTH + app.config.BORDER_WIDTH,
          fullCellHeight = app.config.CELL_HEIGHT + app.config.BORDER_WIDTH;
      app.universe.forEachCell(function (cell) {
        x = cell.x * fullCellWidth + app.config.BORDER_WIDTH;
        y = cell.y * fullCellWidth + app.config.BORDER_WIDTH;
        cell.calculateColor();
        context.fillStyle = cell.color;
        context.fillRect(x, y, app.config.CELL_WIDTH, app.config.CELL_HEIGHT);
      });
    },

    /**
     * @property minNeighborsToLive
     * @type Number
     * @default 2
     */
    minNeighborsToLive: app.config.MIN_NEIGHBORS_TO_LIVE,

    /**
     * @property mmaxNeighborsToLive
     * @type Number
     * @default 3
     */
    maxNeighborsToLive: app.config.MAX_NEIGHBORS_TO_LIVE,

    /**
     * @property neighborsToBeBorn
     * @type Number
     * @default 3
     */
    neighborsToBeBorn: app.config.NEIGHBORS_TO_BE_BORN,

    /**
     * @property timeInterval
     * @type Number
     * @default 40
     */
    timeInterval: app.config.TIME_INTERVAL,

    /**
     * @property intervalID
     * @type {Number}
     */
    intervalID: null,

    /**
     * @property rAFID
     * @type {Number}
     */
    rAFID: null,

    /**
     * @property step
     * @type Number
     * @default 0
     */
    step: 0
  };

  return GOL;
});