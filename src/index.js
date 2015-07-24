(function (w) {

  "use strict";

  var UNIVERSE_WIDTH = 121,
      UNIVERSE_HEIGHT = 81,
      CELL_WIDTH = 6,
      CELL_HEIGHT = 6,
      BORDER_WIDTH = 1,
      MIN_NEIGHBORS_TO_LIVE = 2,
      MAX_NEIGHBORS_TO_LIVE = 3,
      NEIGHBORS_TO_BE_BORN = 3,
      AGE_COLOR_MULTIPLYER = 10,
      DEATH_COUNT_WITHRAW = 0.2,
      ALIVE_NEIGHBORS_COLOR_MULTIPLYER = 3,
      DEAD_COLOR_MULTIPLYER = 10,
      TIME_INTERVAL = 40,
      ALIVE_MULTI_COLOR_THRESHOLD  = 100,
      DEAD_MULTI_COLOR_THRESHOLD  = 255,
      FULL_CELL_WIDTH = CELL_WIDTH + BORDER_WIDTH,
      FULL_CELL_HEIGHT = CELL_HEIGHT + BORDER_WIDTH,
      ALIVE_COLOR = 'black',
      DEAD_COLOR = 'white';

  var GameOfLife = function () {
    var gol = this;
    w.g = gol;

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
      var x = Math.floor((event.layerX - BORDER_WIDTH) / FULL_CELL_WIDTH),
          y = Math.floor((event.layerY - BORDER_WIDTH) / FULL_CELL_HEIGHT);
      gol.toggleCell.call(gol, x, y);
    }

    var Universe = function () {
      this.width = UNIVERSE_WIDTH;
      this.height = UNIVERSE_HEIGHT;
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
            space[x][y] = new Cell(x, y);
          }
        }
        return space;
      },
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
      }
    };

    var Cell = function (x, y) {
      this.isAlive = false;
      this.age = 0;
      this.deathCount = 0;
      this.aliveNeighborsCount = 0;
      this.willLiveNextStep = null;
      this.color = DEAD_COLOR;
      this.x = x;
      this.y = y;
    };
    Cell.prototype = {
      revive: function () {
        if (!this.isAlive) {
          this.isAlive = true;
        }
      },
      kill: function () {
        if (this.isAlive) {
          this.isAlive = false;
        }
      },
      calculateColor: function () {
        var r , g, b, deathCount, aliveMulti, deadMulti;
        if (this.isAlive) {
          aliveMulti = this.age * AGE_COLOR_MULTIPLYER + this.aliveNeighborsCount * ALIVE_NEIGHBORS_COLOR_MULTIPLYER;
          r = 0;
          g = b = aliveMulti < ALIVE_MULTI_COLOR_THRESHOLD ? aliveMulti : ALIVE_MULTI_COLOR_THRESHOLD;
          this.color = this.age === 0 ? ALIVE_COLOR : 'rgb(' + r + ',' + g + ',' + b + ')';
        } else {
          deathCount = Math.floor(this.deathCount);
          deadMulti = deathCount * DEAD_COLOR_MULTIPLYER;
          r = 255;
          g = b = deadMulti < DEAD_MULTI_COLOR_THRESHOLD ? DEAD_MULTI_COLOR_THRESHOLD - deadMulti : 0;
          this.color = deadMulti === 0 ? DEAD_COLOR : 'rgb(' + r + ',' + g + ',' + b + ')';
        }
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
        canvas.width = UNIVERSE_WIDTH * FULL_CELL_WIDTH + BORDER_WIDTH;
        canvas.height = UNIVERSE_HEIGHT * FULL_CELL_HEIGHT + BORDER_WIDTH;
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

    this.minNeighborsToLive = MIN_NEIGHBORS_TO_LIVE;
    this.maxNeighborsToLive = MAX_NEIGHBORS_TO_LIVE;
    this.neighborsToBeBorn = NEIGHBORS_TO_BE_BORN;
    this.timeInterval = TIME_INTERVAL;
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
        if (!cell.isAlive && cell.willLiveNextStep) {
          cell.revive();
        } else if (cell.isAlive && cell.willLiveNextStep) {
          cell.age++;
        } else if (!cell.isAlive && !cell.willLiveNextStep) {
          cell.deathCount -= cell.deathCount > DEATH_COUNT_WITHRAW ? DEATH_COUNT_WITHRAW : 0;
        } else if (cell.isAlive && !cell.willLiveNextStep) {
          cell.kill();
          this.deathCount++;
          cell.age = 0;
        }
      });
      sync = this.universe.forEachCell(function (cell) {
        cell.aliveNeighborsCount = cell.calculateAliveNeighbors();
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
      var aliveNeighbors;
      this.universe.forEachCell(function (cell) {
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
        cell.calculateColor();
        x = cell.x * FULL_CELL_WIDTH + BORDER_WIDTH;
        y = cell.y * FULL_CELL_HEIGHT + BORDER_WIDTH;
        context.fillStyle = cell.color;
        context.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      });
    },
    appendTo: function (element) {
      var universe = this.ui.createUniverse(),
          menu = this.ui.createMenu(),
          stepDisplay = this.ui.createStepDisplay(),
          inputPanel = this.ui.createInputPanel();
      element.appendChild(universe);
      element.appendChild(stepDisplay);
      element.appendChild(inputPanel);
      element.appendChild(menu);
    }
  };

  return new GameOfLife();
})(window);