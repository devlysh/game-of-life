(function (w) {

  "use strict";

  var d = w.document,
      lS = w.localStorage,
      rAF = w.requestAnimationFrame,
      cAF = w.cancelAnimationFrame,
      sI = w.setInterval,
      cI = w.clearInterval;

  var DEFAULT_UNIVERSE_WIDTH = 121,
      DEFAULT_UNIVERSE_HEIGHT = 81,
      DEFAULT_MIN_NEIGHBORS_TO_LIVE = 2,
      DEFAULT_MAX_NEIGHBORS_TO_LIVE = 3,
      DEFAULT_NEIGHBORS_TO_BE_BORN = 3,
      DEFAULT_TIME_INTERVAL = 40;

  var GameOfLife = function () {
    var gol = this;

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
      var target = event.target;
      if (!target.classList.contains('cell')) { return; }
      gol.toggleCell.call(gol, target.cellData.x, target.cellData.y);
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
      this.willLiveNextStep = null;
      this.element = element;
      this.deathCounter = 0;
      this.x = x;
      this.y = y;
    };
    Cell.prototype = {
      revive: function () {
        if (!this.isAlive) {
          this.isAlive = true;
          this.element.classList.add('alive');
        }
      },
      kill: function () {
        if (this.isAlive) {
          this.isAlive = false;
          this.element.classList.remove('alive');
          this.drench();
          this.deathCounter++;
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
      },
      drench: function () {
        var saturation = this.deathCounter / 100;
        this.element.style.backgroundColor = 'rgba(255, 100, 100,' + saturation + ')';
      }
    };

    var UI = function () {
      this.stepDisplayElement = null;
      this.minNeighborsToLiveElement = null;
      this.maxNeighborsToLiveElement = null;
      this.neighborsToBeBornElement = null;
    };
    UI.prototype = {
      createUniverse: function () {
        var x, y, table, row, cellElement,
            width = gol.universe.width,
            height = gol.universe.height;
        table = d.createElement('table');
        table.classList.add('universe');
        table.addEventListener('click', toggleCellListener);
        for (y = 0; y < height; y++) {
          row = d.createElement('tr');
          for (x = 0; x < width; x++) {
            cellElement = d.createElement('td');
            cellElement.classList.add('cell');
            cellElement.cellData = {x: x, y: y};
            row.appendChild(cellElement);
            gol.universe.space[x][y].element = cellElement;
          }
          table.appendChild(row);
        }
        return table;
      },
      createMenu: function () {
        var menu = d.getElementById('menu-template').content,
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
        var stepDisplay = d.getElementById('step-display-template').content;
        this.stepDisplayElement = stepDisplay.querySelector('.step-display span');
        return stepDisplay;
      },
      createInputPanel: function () {
        var inputPanel = d.getElementById('input-panel-template').content,
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
      var savedGame = lS.getItem('savedGame');
      this.appendTo(d.getElementById('zero'));
      if (savedGame) {
        this.load();
      } else {
        this.load('defaultGame');
      }
    },
    start: function () {
      if (!this.intervalID) {
        this.intervalID = sI(this.stepForward.bind(this), this.timeInterval);
      }
    },
    stop: function () {
      cI(this.intervalID);
      this.intervalID = null;
    },
    stepForward: function () {
      cAF(this.rAFID);
      this.rAFID = rAF(this.rAFStep.bind(this));
    },
    rAFStep: function () {
      this.calculateNextStep();
      this.render();
      this.updateStepCounter(this.step + 1);
    },
    save: function (name) {
      name = name || 'savedGame';
      lS.setItem(name, this.universe.toLocaleString());
    },
    load: function (name) {
      var data, loadedGame;
      name = name || 'savedGame';
      data = lS.getItem(name);
      if (data) {
        loadedGame = JSON.parse(data);
        this.killAllCells();
        this.updateStepCounter(loadedGame.step);
        loadedGame.space.forEach(function (cell) {
          this.universe.space[cell.x][cell.y].revive();
        }.bind(this));
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
    },
    killAllCells: function () {
      this.universe.forEachCell(function (cell) {
        cell.kill();
        cell.willLiveNextStep = null;
      });
      this.updateStepCounter(0);
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
      } else {
        throw new Error('"value" should be a number or undefined');
      }
      this.ui.stepDisplayElement.innerHTML = value;
    },
    render: function () {
      this.universe.forEachCell(function (cell) {
        if (cell.willLiveNextStep) {
          cell.revive();
        } else {
          cell.kill();
        }
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