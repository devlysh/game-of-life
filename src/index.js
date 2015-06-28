(function (w) {

  "use strict";

  var MIN_ALIVE_NEIGHBORS_TO_LIVE = 2;
  var MAX_ALIVE_NEIGHBORS_TO_LIVE = 3;
  var ALIVE_NEIGHBORS_TO_BE_BORN = 3;
  var UNIVERSE_WIDTH = 80;
  var UNIVERSE_HEIGHT = 60;
  var INTERVAL = 100;

  var DEFAULT_ALIVE = false;
  var DEFAULT_NEXT_STEP = null;
  var DEFAULT_STEP_COUNT = 0;
  var DEFAULT_INTERVAL_ID = null;

  var d = w.document;
  var b = d.body;
  var ls = w.localStorage;
  var zeroElement = d.getElementById('zero');
  var stepDisplayElement;

  var GOL = function () {
    var gol = this;

    /* UNIVERSE */
    var Universe = function () {
      this.width = UNIVERSE_WIDTH;
      this.height = UNIVERSE_HEIGHT;
      this.space = new Space(this.width, this.height);
    };
    Universe.prototype.toString = function () {
      var result = {};
      var plainSpace = [];
      var space = this.space;
      for (var x = 0; x < this.width; x++) {
        plainSpace.push([]);
        for (var y = 0; y < this.height; y++) {
          plainSpace[x][y] = {
            x: this.x,
            y: this.y,
            isAlive: space[x][y].isAlive
          };
        }
      }
      result.space = plainSpace;
      result.step = gol.step;
      return JSON.stringify(result);
    };
    Universe.prototype.createUniverse = function (width, height) {
      //TODO: Refactor this method, divide into components
      if (width) { this.width = width; } else { width = this.width; }
      if (height) {this.height = height; } else {height = this.height; }
      var universe = d.createElement('table');
      universe.classList.add('universe');
      universe.addEventListener('click', Cell.prototype.toggleAliveListener);
      for (var y = 0; y < height; y++) {
        var row = d.createElement('tr');
        for (var x = 0; x < width; x++) {
          var cellElement = d.createElement('td');
          cellElement.classList.add('cell');
          cellElement.cellData = {
            x: x,
            y: y
          };
          var cell = new Cell(x, y, cellElement);
          this.space[x][y] = cell;
          row.appendChild(cellElement);
        }
        universe.appendChild(row);
      }
      return universe;
    };
    Universe.prototype.createMenu = function () {
      //TODO: Move UI components to other class
      var menu = d.createElement('div');
      menu.classList.add('menu');

      var startButton = d.createElement('button'); menu.appendChild(startButton);
      startButton.appendChild(d.createTextNode('START'));
      startButton.classList.add('button');
      startButton.classList.add('start-button');
      startButton.addEventListener('click', gol.start.bind(gol));

      var stopButton = d.createElement('button'); menu.appendChild(stopButton);
      stopButton.appendChild(d.createTextNode('STOP'));
      stopButton.classList.add('button');
      stopButton.classList.add('stop-button');
      stopButton.addEventListener('click', gol.stop.bind(gol));

      var stepButton = d.createElement('button'); menu.appendChild(stepButton);
      stepButton.appendChild(d.createTextNode('NEXT STEP'));
      stepButton.classList.add('button');
      stepButton.classList.add('step-button');
      stepButton.addEventListener('click', gol.stepForward.bind(gol));

      var saveButton = d.createElement('button'); menu.appendChild(saveButton);
      saveButton.appendChild(d.createTextNode('SAVE'));
      saveButton.classList.add('button');
      saveButton.classList.add('save-button');
      saveButton.addEventListener('click', gol.save.bind(gol));

      var loadButton = d.createElement('button'); menu.appendChild(loadButton);
      loadButton.appendChild(d.createTextNode('LOAD'));
      loadButton.classList.add('button');
      loadButton.classList.add('load-button');
      loadButton.addEventListener('click', gol.load.bind(gol));

      return menu;
    };
    Universe.prototype.createStepDisplay = function () {
      //TODO: Move UI components to other class
      var stepDisplay = d.createElement('div');
      stepDisplay.classList.add('step-display');
      stepDisplay.appendChild(d.createTextNode(DEFAULT_STEP_COUNT));
      stepDisplayElement = stepDisplay;
      return stepDisplay;
    };
    Universe.prototype.appendTo = function (element, width, height) {
      var universe = this.createUniverse(width, height);
      var menu = this.createMenu();
      var stepDisplay = this.createStepDisplay();
      element.appendChild(universe);
      element.appendChild(menu);
      element.appendChild(stepDisplay);
    };

    /* SPACE */
    var Space = function (width, height) {
      var s = new Array(width);
      for (var c = 0; c < s.length; c++) {
        s[c] = new Array(height);
      }
      return s;
    };

    /* CELL */
    var Cell = function (x, y, element) {
      this.isAlive = DEFAULT_ALIVE;
      this.willLiveNextStep = DEFAULT_NEXT_STEP;
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
      var x = this.x;
      var y = this.y;
      var space = gol.universe.space;
      var MIN_X = 0;
      var MIN_Y = 0;
      var MAX_X = gol.universe.width;
      var MAX_Y = gol.universe.height;

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

    this.universe = new Universe();
    this.step = DEFAULT_STEP_COUNT;
    this.intervalID = DEFAULT_INTERVAL_ID;
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
  GOL.prototype.save = function (event, name) {
    name = name || 'space';
    ls.setItem(name, this.universe.toString());
  };
  GOL.prototype.load = function (event, name) {
    name = name || 'space';
    var space = this.universe.space;
    var loadedGame = JSON.parse(ls.getItem(name));
    var loadedSpace = loadedGame.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        space[x][y].willLiveNextStep = loadedSpace[x][y].isAlive;
      }
    }
    gol.step = loadedGame.step;
    this.render();
  };
  GOL.prototype.calculateNextStep = function () {
    var space = this.universe.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        var cell = space[x][y];
        var aliveNeighbours = cell.calculateAliveNeighbors();
        if (cell.isAlive) {
          if (aliveNeighbours < MIN_ALIVE_NEIGHBORS_TO_LIVE) {
            cell.willLiveNextStep = false;
          } else if (aliveNeighbours > MAX_ALIVE_NEIGHBORS_TO_LIVE) {
            cell.willLiveNextStep = false;
          } else {
            cell.willLiveNextStep = true;
          }
        } else {
          if (aliveNeighbours === ALIVE_NEIGHBORS_TO_BE_BORN) {
            cell.willLiveNextStep = true;
          }
        }
      }
    }
  };
  GOL.prototype.updateStepCounter = function () {
    stepDisplayElement.innerHTML = this.step;
  };
  GOL.prototype.render = function () {
    var space = this.universe.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        var cell = space[x][y];
        if (cell.willLiveNextStep) {
          cell.revive();
        } else {
          cell.kill();
        }
      }
    }
    this.updateStepCounter();
  };

  var gol = new GOL();
  gol.universe.appendTo(zeroElement);

})(window);
