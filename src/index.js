var g;

(function (w) {

  var d = w.document;
  var b = d.body;
  var ls = w.localStorage;

  var UNIVERSE_WIDTH = 40;
  var UNIVERSE_HEIGHT = 60;
  var DEFAULT_ALIVE = false;
  var DEFAULT_NEXT_STEP = null;
  var INTERVAL = 1000;

  var GOL = function () {
    var gol = this;

    /* UNIVERSE */
    var Universe = function () {
      this.width = UNIVERSE_WIDTH;
      this.height = UNIVERSE_HEIGHT;

      this.space = (function () {
        var s = new Array(this.width);
        for (var c = 0; c < s.length; c++) {
          s[c] = new Array(this.height);
        }
        return s;
      }.bind(this))();
    };
    Universe.prototype.createUniverse = function (width, height) {
      if (width) this.width = width; else width = this.width;
      if (height) this.height = height; else height = this.height;
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
    Universe.prototype.appendTo = function (element, width, height) {
      var universe = this.createUniverse(width, height);
      element.appendChild(universe);
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
      if (!target.classList.contains('cell')) return;
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
        if (x-1 > MIN_X && y-1 > MIN_Y ) c.push(space[x-1][y-1]);
        if (x+1 < MAX_X && y-1 > MIN_Y ) c.push(space[x+1][y-1]);
        if (x+1 < MAX_X && y+1 < MAX_Y ) c.push(space[x+1][y+1]);
        if (x-1 > MIN_X && y+1 < MAX_Y ) c.push(space[x-1][y+1]);
        if (y-1 > MIN_Y ) c.push(space[x][y-1]);
        if (x+1 < MAX_X ) c.push(space[x+1][y]);
        if (y+1 < MAX_Y ) c.push(space[x][y+1]);
        if (x-1 > MIN_X ) c.push(space[x-1][y]);
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
    this.intervalID = null;
  };

  GOL.prototype.start = function () {
    this.intervalID = w.setInterval(this.step.bind(this), INTERVAL);
  };
  GOL.prototype.stop = function () {
    w.clearInterval(this.intervalID);
  };
  GOL.prototype.calculateNextStep = function () {
    var space = this.universe.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        var cell = space[x][y];
        var aliveNeighbours = cell.calculateAliveNeighbors();
        if (cell.isAlive) {
          if (aliveNeighbours < 2) {
            cell.willLiveNextStep = false;
          } else if (aliveNeighbours > 3) {
            cell.willLiveNextStep = false;
          } else {
            cell.willLiveNextStep = true;
          }
        } else {
          if (aliveNeighbours === 3) {
            cell.willLiveNextStep = true;
          }
        }
      }
    }
  };
  GOL.prototype.step = function () {
    var space = this.universe.space;
    this.calculateNextStep();
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
  };

  var gol = new GOL();
  gol.universe.appendTo(b);
  g = gol;

})(window);
