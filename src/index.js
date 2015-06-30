(function (w) {

  "use strict";

  var DEFAULT_UNIVERSE_WIDTH = 120;
  var DEFAULT_UNIVERSE_HEIGHT = 80;
  var INTERVAL = 40;

  var DEFAULT_MIN_NEIGHBORS_TO_LIVE = 2;
  var DEFAULT_MAX_NEIGHBORS_TO_LIVE = 3;
  var DEFAULT_NEIGHBORS_TO_BE_BORN = 3;

  var d = w.document;
  var ls = w.localStorage;
  var zeroElement = d.getElementById('zero');

  var GOL = function () {
    var gol = this;

    /* UNIVERSE */
    var Universe = function () {
      this.width = DEFAULT_UNIVERSE_WIDTH;
      this.height = DEFAULT_UNIVERSE_HEIGHT;
      this.space = this.createSpace(this.width, this.height);
    };
    Universe.prototype.toLocaleString = function () {
      var sync;
      var result = {};
      var plainSpace = this.createSpace(this.width, this.height);
      var space = this.space;
      sync = this.forEachCell(function (cell, x, y) {
        plainSpace[x][y] = {
          x: cell.x,
          y: cell.y,
          isAlive: space[x][y].isAlive
        };
      });
      result.space = plainSpace;
      result.step = gol.step;
      return JSON.stringify(result);
    };
    Universe.prototype.create = function () {
      //TODO: Refactor this method, divide into components
      var width = this.width;
      var height = this.height;
      var table = d.createElement('table');
      table.classList.add('universe');
      table.onclick = gol.toggleCellListener.bind(gol);
      for (var y = 0; y < height; y++) {
        var row = d.createElement('tr');
        for (var x = 0; x < width; x++) {
          var cellElement = d.createElement('td');
          cellElement.classList.add('cell');
          cellElement.cellData = { x: x, y: y };
          var newCell = new Cell(x, y, cellElement);
          this.space[x][y] = newCell;
          row.appendChild(cellElement);
        }
        table.appendChild(row);
      }
      return table;
    };
    Universe.prototype.createSpace = function (width, height) {
      var space = new Array(width);
      for (var i = 0; i < width; i++) {
        space[i] = new Array(height);
      }
      return space;
    };
    Universe.prototype.forEachCell = function (callback) {
      var space = this.space;
      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
          var cell = space[x][y];
          callback.apply(cell, [cell, x, y]);
        }
      }
    };

    /* CELL */
    var Cell = function (x, y, element) {
      this.isAlive = false;
      this.willLiveNextStep = null;
      this.element = element;
      this.death = 0;
      this.x = x;
      this.y = y;
    };
    Cell.prototype.revive = function () {
      if (!this.isAlive) {
        this.isAlive = true;
        this.element.classList.add('alive');
      }
    };
    Cell.prototype.kill = function () {
      if (this.isAlive) {
        this.death++;
        this.isAlive = false;
        this.drench();
        this.element.classList.remove('alive');
      }
    };
    Cell.prototype.findCellsAround = function () {
      var MIN_X = 0;
      var MIN_Y = 0;
      var MAX_X = gol.universe.width;
      var MAX_Y = gol.universe.height;
      var space = gol.universe.space;
      var x = this.x;
      var y = this.y;
      var cellsAround = (function () {
        var c = [];
        if (x-1 > MIN_X && y-1 > MIN_Y ) { c.push(space[x-1][y-1]); }
        if (x+1 < MAX_X && y-1 > MIN_Y ) { c.push(space[x+1][y-1]); }
        if (x+1 < MAX_X && y+1 < MAX_Y ) { c.push(space[x+1][y+1]); }
        if (x-1 > MIN_X && y+1 < MAX_Y ) { c.push(space[x-1][y+1]); }
        if (y-1 > MIN_Y ) { c.push(space[x][y-1]); }
        if (x+1 < MAX_X ) { c.push(space[x+1][y]); }
        if (y+1 < MAX_Y ) { c.push(space[x][y+1]); }
        if (x-1 > MIN_X ) { c.push(space[x-1][y]); }
        return c;
      })();
      return cellsAround;
    };
    Cell.prototype.calculateAliveNeighbors = function () {
      return this.findCellsAround().filter(function(cell) {
        return cell.isAlive;
      }).length;
    };
    Cell.prototype.drench = function () {
      var saturation = this.death / 100;
      this.element.style.backgroundColor = 'rgba(0,0,0,' + saturation + ')';
    };

    /* UI */
    var UI = function () {
      this.stepDisplayElement = null;
    };
    UI.prototype.createMenu = function () {
      var menu = d.getElementById('menu-template').content;
      var startButton = menu.querySelector('.start-button');
      var stopButton = menu.querySelector('.stop-button');
      var stepButton = menu.querySelector('.step-button');
      var clearButton = menu.querySelector('.clear-button');
      var saveButton = menu.querySelector('.save-button');
      var loadButton = menu.querySelector('.load-button');
      startButton.onclick = gol.startListener.bind(gol);
      stopButton.onclick = gol.stopListener.bind(gol);
      stepButton.onclick = gol.stepForwardListener.bind(gol);
      clearButton.onclick = gol.killAllCellsListener.bind(gol);
      saveButton.onclick = gol.saveListener.bind(gol);
      loadButton.onclick = gol.loadListener.bind(gol);
      return menu;
    };
    UI.prototype.createStepDisplay = function () {
      var stepDisplay = d.getElementById('step-display-template').content;
      this.stepDisplayElement = stepDisplay.querySelector('.step-display span');
      return stepDisplay;
    };
    UI.prototype.createInputPanel = function () {
      var inputPanel = d.getElementById('input-panel-template').content;
      var minToLive = inputPanel.querySelector('.min-to-live');
      var maxToLive = inputPanel.querySelector('.max-to-live');
      var toBeBorn = inputPanel.querySelector('.to-be-born');
      minToLive.oninput = gol.changeLifeConditionsListener.bind(gol);
      maxToLive.oninput = gol.changeLifeConditionsListener.bind(gol);
      toBeBorn.oninput = gol.changeLifeConditionsListener.bind(gol);
      minToLive.value = gol.minAliveNeighborsToLive;
      maxToLive.value = gol.maxAliveNeighborsToLive;
      toBeBorn.value = gol.aliveNeighborsToBeBorn;
      return inputPanel;
    };

    this.ui = new UI();
    this.universe = new Universe();
    this.minAliveNeighborsToLive = DEFAULT_MIN_NEIGHBORS_TO_LIVE;
    this.maxAliveNeighborsToLive = DEFAULT_MAX_NEIGHBORS_TO_LIVE;
    this.aliveNeighborsToBeBorn = DEFAULT_NEIGHBORS_TO_BE_BORN;
    this.intervalID = null;
    this.step = 0;
  };
  GOL.prototype.start = function () {
    if (!this.intervalID) {
      this.intervalID = w.setInterval(this.stepForward.bind(this), INTERVAL);
    }
  };
  GOL.prototype.stop = function () {
    w.clearInterval(this.intervalID);
    this.intervalID = null;
  };
  GOL.prototype.stepForward = function () {
    this.step++;
    this.calculateNextStep();
    this.render();
  };
  GOL.prototype.save = function (name) {
    name = name || 'savedGame';
    ls.setItem(name, this.universe.toLocaleString());
  };
  GOL.prototype.load = function (name) {
    name = name || 'savedGame';
    var sync;
    var loadedData = ls.getItem(name);
    if (loadedData) {
      var loadedGame = JSON.parse(loadedData);
      var loadedSpace = loadedGame.space;
      sync = this.universe.forEachCell(function (cell, x, y) {
        cell.willLiveNextStep = loadedSpace[x][y].isAlive;
      });
      this.step = loadedGame.step;
      this.render();
    }
  };
  GOL.prototype.toggleCell = function (event) {
    var target = event.target || event.path[0];
    if (!target.classList.contains('cell')) { return; }
    var x = target.cellData.x;
    var y = target.cellData.y;
    var cell = this.universe.space[x][y];
    if (cell.isAlive) {
      cell.kill();
    } else {
      cell.revive();
    }
    this.calculateNextStep();
  };
  GOL.prototype.killAllCells = function () {
    this.universe.forEachCell(function (cell) {
      cell.kill();
      cell.willLiveNextStep = false;
    });
    gol.updateStepCounter(0);
  };
  GOL.prototype.changeLifeConditions = function (key, value) {
    this[key] = value;
    this.calculateNextStep();
  };
  GOL.prototype.calculateNextStep = function () {
    this.universe.forEachCell(function (cell) {
      var aliveNeighbours = cell.calculateAliveNeighbors();
      if (cell.isAlive) {
        if (aliveNeighbours < this.minAliveNeighborsToLive) {
          cell.willLiveNextStep = false;
        } else if (aliveNeighbours > this.maxAliveNeighborsToLive) {
          cell.willLiveNextStep = false;
        } else {
          cell.willLiveNextStep = true;
        }
      } else {
        if (aliveNeighbours === this.aliveNeighborsToBeBorn) {
          cell.willLiveNextStep = true;
        }
      }
    }.bind(this));
  };
  GOL.prototype.updateStepCounter = function (value) {
    if (typeof value === 'number') { this.step = value; } else { value = this.step; }
    this.ui.stepDisplayElement.innerHTML = value;
  };
  GOL.prototype.render = function () {
    this.updateStepCounter();
    this.universe.forEachCell(function (cell) {
      if (cell.willLiveNextStep) {
        cell.revive();
      } else {
        cell.kill();
      }
    });
  };
  GOL.prototype.appendTo = function (element, width, height) {
    var universe = this.universe.create(width, height);
    var menu = this.ui.createMenu();
    var stepDisplay = this.ui.createStepDisplay();
    var inputPanel = this.ui.createInputPanel();
    element.appendChild(universe);
    element.appendChild(menu);
    element.appendChild(stepDisplay);
    element.appendChild(inputPanel);
  };
  GOL.prototype.startListener = function (event) {
    this.start.call(this);
  };
  GOL.prototype.stopListener = function (event) {
    this.stop.call(this);
  };
  GOL.prototype.stepForwardListener = function (event) {
    this.stepForward.call(this);
  };
  GOL.prototype.killAllCellsListener = function (event) {
    this.killAllCells.call(this);
  };
  GOL.prototype.saveListener = function (event) {
    this.save.call(this);
  };
  GOL.prototype.loadListener = function (event) {
    this.load.call(this);
  };
  GOL.prototype.changeLifeConditionsListener = function (event) {
    var k, v;
    var target = event.target;
    target.parentElement.querySelector('span').innerHTML = target.value;
    if (event.target.name === 'min-to-live') { k = 'minAliveNeighborsToLive'; v = Number(target.value); }
    if (event.target.name === 'max-to-live') { k = 'maxAliveNeighborsToLive'; v = Number(target.value); }
    if (event.target.name === 'to-be-born') { k = 'aliveNeighborsToBeBorn'; v = Number(target.value); }
    this.changeLifeConditions.call(this, k, v);
  };
  GOL.prototype.toggleCellListener = function (event) {
    this.toggleCell.call(this, event);
  };

  var gol = new GOL();
  var defaultGame = ls.getItem('defaultGame');
  var savedGame = ls.getItem('savedGame');
  gol.appendTo(zeroElement);
  if (!savedGame) {
    gol.load('defaultGame');
  } else {
    gol.load();
  }

  g = gol;

})(window);

var g;