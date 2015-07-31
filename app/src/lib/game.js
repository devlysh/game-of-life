/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

(function () {
  var GOL = G.app('gameOfLife');

  GOL.sandbox.add('Game', function () {
    var fullCellWidth, fullCellHeight, borderWidth, cellWidth, cellHeight;

    /**
     * @class Game
     * @constructor
     */
    var Game = function () {
      fullCellWidth = GOL.config.CELL_WIDTH + GOL.config.BORDER_WIDTH;
      fullCellHeight = GOL.config.CELL_HEIGHT + GOL.config.BORDER_WIDTH;
      borderWidth = GOL.config.BORDER_WIDTH;
      cellWidth = GOL.config.CELL_WIDTH;
      cellHeight = GOL.config.CELL_HEIGHT;

      this.minNeighborsToLive = GOL.config.MIN_NEIGHBORS_TO_LIVE;
      this.maxNeighborsToLive = GOL.config.MAX_NEIGHBORS_TO_LIVE;
      this.neighborsToBeBorn = GOL.config.NEIGHBORS_TO_BE_BORN;
      this.timeInterval = GOL.config.TIME_INTERVAL;
      this.step = GOL.config.STEP;
    };
    Game.prototype = {
      /**
       * Initiates Game Of Life
       *
       * @method init
       */
      init: function () {
        var savedGame = localStorage.getItem('savedGame');
        GOL.module('ui').appendTo(document.getElementById('zero'));
        if (savedGame) {
          this.load();
        } else {
          window.localStorage.setItem('defaultGame', GOL.sandbox.get('defaultGame'));
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
        this.calculateNextStep();
        sync = GOL.module('universe').forEachCell(function (cell) {
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
        localStorage.setItem(name, GOL.module('universe').toLocaleString());
      },

      /**
       * Loads game from LocalStorage
       *
       * @method load
       * @param name {String} Name of game to load
       */
      load: function (name) {
        var data, loadedGame, sync;
        name = name || 'savedGame';
        data = window.localStorage.getItem(name);
        if (data) {
          loadedGame = JSON.parse(data);
          this.killAllCells();
          this.setStepCounter(loadedGame.step);
          sync = loadedGame.space.forEach(function (cell) {
            GOL.module('universe').space[cell.x][cell.y].revive();
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
        var cell = GOL.module('universe').space[x][y];
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
        GOL.module('universe').forEachCell(function (cell) {
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
        GOL.module('ui')[key + 'Element'].value = value;
        GOL.module('ui')[key + 'Element'].parentElement.querySelector('span').innerHTML = value;
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
        GOL.module('universe').forEachCell(function (cell) {
          aliveNeighbors = this.calculateAliveNeighborsOf(cell);
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
       * @method calculateAliveNeighbors
       * @param cell {Cell} Cell around witch alive neighbors will be found
       * @return {Number} count of alive neighbors
       */
      calculateAliveNeighborsOf: function (cell) {
        var space = GOL.module('universe').space;
        return cell.neighborsCoordinates
          .map(function (coorditanes) {
            return space[coorditanes.x][coorditanes.y];
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
        GOL.module('ui').stepDisplayElement.innerHTML = value;
      },

      /**
       * Renders game field
       *
       * @method render
       */
      render: function () {
        var x, y,
            context = GOL.module('ui').universeContext;
        GOL.module('universe').forEachCell(function (cell) {
          x = cell.x * fullCellWidth + borderWidth;
          y = cell.y * fullCellWidth + borderWidth;
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
      minNeighborsToLive: 0,

      /**
       * @property mmaxNeighborsToLive
       * @type Number
       * @default 3
       */
      maxNeighborsToLive: 0,

      /**
       * @property neighborsToBeBorn
       * @type Number
       * @default 3
       */
      neighborsToBeBorn: 0,

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

    return Game;
  });

  console.log('Game loaded');
})();
