(function (w) {

  "use strict";

  var DEFAULT_UNIVERSE_WIDTH = 121,
      DEFAULT_UNIVERSE_HEIGHT = 81,
      DEFAULT_CELL_WIDTH = 6,
      DEFAULT_CELL_HEIGHT = 6,
      DEFAULT_BORDER_WIDTH = 2,
      DEFAULT_MIN_NEIGHBORS_TO_LIVE = 2,
      DEFAULT_MAX_NEIGHBORS_TO_LIVE = 3,
      DEFAULT_NEIGHBORS_TO_BE_BORN = 3,
      DEFAULT_TIME_INTERVAL = 40,
      DEFAULT_ALIVE_COLOR = 'black',
      DEFAULT_DEAD_COLOR = 'white',
      FULL_CELL_WIDTH = DEFAULT_CELL_WIDTH + DEFAULT_BORDER_WIDTH,
      FULL_CELL_HEIGHT = DEFAULT_CELL_HEIGHT + DEFAULT_BORDER_WIDTH;

  var GameOfLife = function () {
    var gol = this;
    window.g = this;

    function startListener () {
      gol.start.call(gol);
    }
    function stopListener () {
      gol.stop.call(gol);
    }
    function stepForwardListener () {
      gol.stepForward.call(gol);
    }
    function killAllCellsListener () {
      gol.killAllCells.call(gol);
    }
    function saveListener () {
      gol.save.call(gol);
    }
    function loadListener () {
      gol.load.call(gol);
    }
    function changeLifeConditionsListener (event) {
      var k, v,
          target = event.target,
          value = target.value;
      if (target.name === 'min-to-live') { k = 'minNeighborsToLive'; v = Number(value); }
      if (target.name === 'max-to-live') { k = 'maxNeighborsToLive'; v = Number(value); }
      if (target.name === 'to-be-born') { k = 'neighborsToBeBorn'; v = Number(value); }
      gol.changeLifeConditions.call(gol, k, v);
    }
    function toggleCellListener (event) {
      var x = Math.floor((event.layerX - DEFAULT_BORDER_WIDTH) / FULL_CELL_WIDTH),
          y = Math.floor((event.layerY - DEFAULT_BORDER_WIDTH) / FULL_CELL_HEIGHT);
      gol.toggleCell.call(gol, x, y);
    }

    var Universe = function () {
      this.width = DEFAULT_UNIVERSE_WIDTH;
      this.height = DEFAULT_UNIVERSE_HEIGHT;
      this.space = this.createSpace(this.width, this.height);
    };
    Universe.prototype = {
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
      createSpace: function (width, height) {
        var x, y,
            space = [];
        for (x = 0; x < width; x++) {
          space[x] = [];
          for (y = 0; y < height; y++) {
            space[x][y] = new Cell(x, y, null);
          }
        }
        return space;
      },
      forEachCell: function (callback) {
        var x, y,
            width = this.width,
            height = this.height,
            space = this.space;
        for (x = 0; x < width; x++) {
          for (y = 0; y < height; y++) {
            var cell = space[x][y];
            callback.apply(cell, [cell, x, y]);
          }
        }
      }
    };

    var Cell = function (x, y, element) {
      this.isAlive = false;
      this.deathCounter = 0;
      this.willLiveNextStep = null;
      this.color = DEFAULT_DEAD_COLOR;
      this.x = x;
      this.y = y;
    };
    Cell.prototype = {
      revive: function () {
        if (!this.isAlive) {
          this.isAlive = true;
          this.calculateColor();
        }
      },
      kill: function () {
        if (this.isAlive) {
          this.isAlive = false;
          this.deathCounter++;
          this.calculateColor();
        }
      },
      calculateColor: function () {
        var saturation = this.deathCounter < 254 ? 255 - this.deathCounter : 0;
        this.color = this.isAlive ? DEFAULT_ALIVE_COLOR : 'rgb(250,' + saturation + ',' + saturation + ')';
      },
      findCellsAround: function () {
        var MIN_X = 0,
            MIN_Y = 0,
            MAX_X = gol.universe.width-1,
            MAX_Y = gol.universe.height-1,
            space = gol.universe.space,
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
      calculateAliveNeighbors: function () {
        return this.findCellsAround()
          .filter(function(cell) {
            return cell.isAlive;
          })
          .length;
      }
    };

    var UI = function () {
      this.stepDisplayElement = null;
      this.minNeighborsToLiveElement = null;
      this.maxNeighborsToLiveElement = null;
      this.neighborsToBeBornElement = null;
      this.universe = null;
      this.universeContext = null;
    };
    UI.prototype = {
      createUniverse: function () {
        var i, j,
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        canvas.width = DEFAULT_UNIVERSE_WIDTH * FULL_CELL_WIDTH + DEFAULT_BORDER_WIDTH;
        canvas.height = DEFAULT_UNIVERSE_HEIGHT * FULL_CELL_HEIGHT + DEFAULT_BORDER_WIDTH;
        canvas.classList.add('universe');
        canvas.addEventListener('click', toggleCellListener);
        this.universe  = canvas;
        this.universeContext = context;
        return canvas;
      },
      createMenu: function () {
        var menu = document.getElementById('menu-template').content,
            startButton = menu.querySelector('.start-button'),
            stopButton = menu.querySelector('.stop-button'),
            stepButton = menu.querySelector('.step-button'),
            clearButton = menu.querySelector('.clear-button'),
            saveButton = menu.querySelector('.save-button'),
            loadButton = menu.querySelector('.load-button');
        startButton.addEventListener('click', startListener);
        stopButton.addEventListener('click', stopListener);
        stepButton.addEventListener('click', stepForwardListener);
        clearButton.addEventListener('click', killAllCellsListener);
        saveButton.addEventListener('click', saveListener);
        loadButton.addEventListener('click', loadListener);
        return menu;
      },
      createStepDisplay: function () {
        var stepDisplay = document.getElementById('step-display-template').content;
        this.stepDisplayElement = stepDisplay.querySelector('.step-display span');
        return stepDisplay;
      },
      createInputPanel: function () {
        var inputPanel = document.getElementById('input-panel-template').content,
            minToLive = inputPanel.querySelector('.min-to-live'),
            maxToLive = inputPanel.querySelector('.max-to-live'),
            toBeBorn = inputPanel.querySelector('.to-be-born');
        this.minNeighborsToLiveElement = minToLive;
        this.maxNeighborsToLiveElement = maxToLive;
        this.neighborsToBeBornElement = toBeBorn;
        minToLive.addEventListener('input', changeLifeConditionsListener);
        maxToLive.addEventListener('input', changeLifeConditionsListener);
        toBeBorn.addEventListener('input', changeLifeConditionsListener);
        minToLive.value = gol.minNeighborsToLive;
        maxToLive.value = gol.maxNeighborsToLive;
        toBeBorn.value = gol.neighborsToBeBorn;
        return inputPanel;
      }
    };

    this.minNeighborsToLive = DEFAULT_MIN_NEIGHBORS_TO_LIVE;
    this.maxNeighborsToLive = DEFAULT_MAX_NEIGHBORS_TO_LIVE;
    this.neighborsToBeBorn = DEFAULT_NEIGHBORS_TO_BE_BORN;
    this.timeInterval = DEFAULT_TIME_INTERVAL;
    this.intervalID = null;
    this.rAFID = null;
    this.step = 0;
    this.universe = new Universe();
    this.ui = new UI();

    this.init();
  };
  GameOfLife.prototype = {
    init: function () {
      var savedGame = localStorage.getItem('savedGame');
      this.appendTo(document.getElementById('zero'));
      if (savedGame) {
        this.load();
      } else {
        this.load('defaultGame');
      }
    },
    start: function () {
      if (!this.intervalID) {
        this.intervalID = setInterval(this.stepForward.bind(this), this.timeInterval);
      }
    },
    stop: function () {
      clearInterval(this.intervalID);
      this.intervalID = null;
    },
    stepForward: function () {
      cancelAnimationFrame(this.rAFID);
      this.rAFID = requestAnimationFrame(this.rAFStep.bind(this));
    },
    rAFStep: function () {
      var sync;
      this.calculateNextStep();
      sync = this.universe.forEachCell(function (cell) {
        if (cell.willLiveNextStep) {
          cell.revive();
        } else {
          cell.kill();
        }
      });
      this.updateStepCounter(this.step + 1);
      this.render();
    },
    save: function (name) {
      name = name || 'savedGame';
      localStorage.setItem(name, this.universe.toLocaleString());
    },
    load: function (name) {
      var data, loadedGame, sync;
      name = name || 'savedGame';
      data = localStorage.getItem(name);
      if (data) {
        loadedGame = JSON.parse(data);
        this.killAllCells();
        this.updateStepCounter(loadedGame.step);
        sync = loadedGame.space.forEach(function (cell) {
          this.universe.space[cell.x][cell.y].revive();
        }.bind(this));
        this.render();
      }
    },
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
    killAllCells: function () {
      this.universe.forEachCell(function (cell) {
        cell.kill();
        cell.willLiveNextStep = null;
      });
      this.updateStepCounter(0);
      this.render();
    },
    changeLifeConditions: function (key, value) {
      this.ui[key + 'Element'].value = value;
      this.ui[key + 'Element'].parentElement.querySelector('span').innerHTML = value;
      this[key] = value;
      this.calculateNextStep();
    },
    calculateNextStep: function () {
      this.universe.forEachCell(function (cell) {
        var aliveNeighbors = cell.calculateAliveNeighbors();
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
    updateStepCounter: function (value) {
      if (typeof value === 'number') {
        this.step = value;
      } else if (typeof value === 'undefined') {
        value = this.step;
      }
      this.ui.stepDisplayElement.innerHTML = value;
    },
    render: function () {
      var x, y,
          context = this.ui.universeContext;
      this.universe.forEachCell(function (cell) {
        x = cell.x * FULL_CELL_WIDTH + DEFAULT_BORDER_WIDTH;
        y = cell.y * FULL_CELL_HEIGHT + DEFAULT_BORDER_WIDTH;
        context.fillStyle = cell.color;
        context.fillRect(x, y, DEFAULT_CELL_WIDTH, DEFAULT_CELL_HEIGHT);
      });
    },
    appendTo: function (element) {
      var universe = this.ui.createUniverse(),
          menu = this.ui.createMenu(),
          stepDisplay = this.ui.createStepDisplay(),
          inputPanel = this.ui.createInputPanel();
      element.appendChild(universe);
      element.appendChild(menu);
      element.appendChild(stepDisplay);
      element.appendChild(inputPanel);
    }
  };

  return new GameOfLife();
})(window);