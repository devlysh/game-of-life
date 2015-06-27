(function (w) {

  var d = w.document;
  var b = d.body;

  var DEFAULT_WIDTH = 30;
  var DEFAULT_HEIGHT = 30;
  var DEFAULT_ALIVE = false;

  var GOL = function () {
    var gol = this;

    /* UNIVERSE */
    var Universe = function () {
      this.width = DEFAULT_WIDTH;
      this.height = DEFAULT_HEIGHT;

      this.space = (function () {
        var s = new Array(this.height);
        for (var c = 0; c < s.length; c++) {
          s[c] = new Array(this.width);
        }
        return s;
      }.bind(this))();
    };
    Universe.prototype.createUniverse = function (width, height) {
      width = width || this.width;
      height = height || this.height;
      var universe = d.createElement('table');
      universe.classList.add('universe');
      for (var y = 0; y < height; y++) {
        var row = d.createElement('tr');
        for (var x = 0; x < width; x++) {
          var cellElement = d.createElement('td');
          var cell = new Cell(x, y, cellElement);
          cellElement.addEventListener('click', cell.toggleAlive);
          cellElement.cell = cell;
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
    this.universe = new Universe();

    /* CELL */
    var Cell = function (x, y, element) {
      this.alive = DEFAULT_ALIVE;
      this.x = x;
      this.y = y;
      this.element = element;
    };
    Cell.prototype.toggleAlive = function (event) {
      var element = event ? this : this.element;
      if (this.alive) {
        this.alive = false;
        element.classList.toggle('alive');
      } else {
        this.alive = true;
        element.classList.toggle('alive');
      }
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
    Cell.prototype.calculateAliveCellsAround = function () {
      var thisCell = this;
      return this.findCellsAround().filter(function(cell) {
        return cell.alive;
      }).length;
    };
    Cell.prototype.calculateDeadCellsAround = function () {
      return this.findCellsAround().filter(function(cell) {
        return !cell.alive;
      }).length;
    };
  };

  GOL.prototype.start = function () {};
  GOL.prototype.stop = function () {};
  GOL.prototype.step = function () {
    var space = this.universe.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        var cell = space[x][y];
        var aliveCellsAround = cell.calculateAliveCellsAround();
        var deadCellsAround = cell.calculateDeadCellsAround();

        console.log(aliveCellsAround, deadCellsAround);
      }
    }
  };

  var gol = new GOL();
  gol.universe.appendTo(b);
  gol.step();

})(window);