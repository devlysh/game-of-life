(function (w) {

  "use strict";

  var UNIVERSE_WIDTH = 120;
  var UNIVERSE_HEIGHT = 80;
  var INTERVAL = 100;

  var DEFAULT_MIN_ALIVE_NEIGHBORS_TO_LIVE = 2;
  var DEFAULT_MAX_ALIVE_NEIGHBORS_TO_LIVE = 3;
  var DEFAULT_ALIVE_NEIGHBORS_TO_BE_BORN = 3;

  var d = w.document;
  var ls = w.localStorage;
  var zeroElement = d.getElementById('zero');

  var GOL = function () {
    var gol = this;

    /* UNIVERSE */
    var Universe = function () {
      this.width = UNIVERSE_WIDTH;
      this.height = UNIVERSE_HEIGHT;
      this.space = gol.createSpace(this.width, this.height);
    };
    Universe.prototype.toLocaleString = function () {
      var sync;
      var result = {};
      var plainSpace = gol.createSpace(this.width, this.height);
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
    Universe.prototype.create = function (width, height) {
      //TODO: Refactor this method, divide into components
      if (width) { this.width = width; } else { width = this.width; }
      if (height) {this.height = height; } else {height = this.height; }
      var table = d.createElement('table');
      table.classList.add('universe');
      table.onclick = Cell.prototype.toggleAliveListener;
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
      this.x = x;
      this.y = y;
      this.element = element;
    };
    Cell.prototype.toggleAliveListener = function (event) {
      var target = event.path[0];
      if (!target.classList.contains('cell')) { return; }
      var x = target.cellData.x;
      var y = target.cellData.y;
      var cell = gol.universe.space[x][y];
      if (cell.isAlive) {
        cell.kill();
      } else {
        cell.revive();
      }
      gol.calculateNextStep();
    };
    Cell.prototype.revive = function () {
      this.isAlive = true;
      this.element.classList.add('alive');
    };
    Cell.prototype.kill = function () {
      this.isAlive = false;
      this.element.classList.remove('alive');
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

    /* UI */
    var UI = function () {
      this.stepDisplayElement = null;
    };
    UI.prototype.createMenu = function () {
      var menuTemplate = d.getElementById('menu-template');
      var startButton = menuTemplate.content.querySelector('.start-button');
      var stopButton = menuTemplate.content.querySelector('.stop-button');
      var stepButton = menuTemplate.content.querySelector('.step-button');
      var clearButton = menuTemplate.content.querySelector('.clear-button');
      var saveButton = menuTemplate.content.querySelector('.save-button');
      var loadButton = menuTemplate.content.querySelector('.load-button');
      startButton.onclick = gol.start.bind(gol);
      stopButton.onclick = gol.stop.bind(gol);
      stepButton.onclick = gol.stepForward.bind(gol);
      clearButton.onclick = gol.killAll.bind(gol);
      saveButton.onclick = gol.save.bind(gol);
      loadButton.onclick = gol.load.bind(gol);
      return menuTemplate.content;
    };
    UI.prototype.createStepDisplay = function () {
      var stepDisplayTemplate = d.getElementById('step-display-template');
      this.stepDisplayElement = stepDisplayTemplate.content.querySelector('.step-display span');
      return stepDisplayTemplate.content;
    };
    UI.prototype.createInputPanel = function () {
      var inputPanelTemplate = d.getElementById('input-panel-template');
      var minToLive = inputPanelTemplate.content.querySelector('.min-to-live');
      var maxToLive = inputPanelTemplate.content.querySelector('.max-to-live');
      var toBeBorn = inputPanelTemplate.content.querySelector('.to-be-born');
      minToLive.oninput = gol.changeLifeContitionsListener;
      maxToLive.oninput = gol.changeLifeContitionsListener;
      toBeBorn.oninput = gol.changeLifeContitionsListener;
      minToLive.value = gol.minAliveNeighborsToLive;
      maxToLive.value = gol.maxAliveNeighborsToLive;
      toBeBorn.value = gol.aliveNeighborsToBeBorn;
      minToLive.name = 'min-to-live';
      maxToLive.name = 'max-to-live';
      toBeBorn.name = 'to-be-born';
      return inputPanelTemplate.content;
    };

    this.ui = new UI();
    this.universe = new Universe();
    this.minAliveNeighborsToLive = DEFAULT_MIN_ALIVE_NEIGHBORS_TO_LIVE;
    this.maxAliveNeighborsToLive = DEFAULT_MAX_ALIVE_NEIGHBORS_TO_LIVE;
    this.aliveNeighborsToBeBorn = DEFAULT_ALIVE_NEIGHBORS_TO_BE_BORN;
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
  GOL.prototype.changeLifeContitionsListener = function (event) {
    var value = event.target.value;
    this.parentElement.children[0].innerHTML = value;
    if (event.target.name === 'min-to-live') { gol.minAliveNeighborsToLive = Number(value); }
    if (event.target.name === 'max-to-live') { gol.maxAliveNeighborsToLive = Number(value); }
    if (event.target.name === 'to-be-born') { gol.aliveNeighborsToBeBorn = Number(value); }
    gol.calculateNextStep();
  };
  GOL.prototype.save = function (event, name) {
    name = name || 'space';
    ls.setItem(name, this.universe.toLocaleString());
  };
  GOL.prototype.load = function (event, name) {
    name = name || 'space';
    var sync;
    var loadedData = ls.getItem(name);
    if (loadedData) {
      var loadedGame = JSON.parse(loadedData);
      var loadedSpace = loadedGame.space;
      sync = this.universe.forEachCell(function (cell, x, y) {
        cell.willLiveNextStep = loadedSpace[x][y].isAlive;
      });
      gol.step = loadedGame.step;
      this.render();
    }
  };
  GOL.prototype.killAll = function () {
    this.universe.forEachCell(function (cell) {
      cell.kill();
    });
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
  GOL.prototype.updateStepCounter = function () {
    this.ui.stepDisplayElement.innerHTML = this.step;
  };
  GOL.prototype.createSpace = function (width, height) {
    var space = new Array(width);
    for (var i = 0; i < width; i++) {
      space[i] = new Array(height);
    }
    return space;
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

  var gol = new GOL();
  gol.appendTo(zeroElement);
  gol.load();

})(window);
