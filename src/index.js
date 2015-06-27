(function (w) {

  var d = w.document;
  var b = d.body;

  var DEFAULT_WIDTH = 50;
  var DEFAULT_HEIGHT = 50;
  var DEFAULT_ALIVE = false;

  var GOL = function () {

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

    /* UNIVERSE */
    var Universe = function () {
      var thisUniverse = this;
      this.width = DEFAULT_WIDTH;
      this.height = DEFAULT_HEIGHT;

      this.space = (function () {
        var s = new Array(thisUniverse.height);
        for (var c = 0; c < s.length; c++) {
          s[c] = new Array(thisUniverse.width);
        }
        return s;
      })();
    };
    Universe.prototype.create = function (width, height) {
      width = width || this.width;
      height = height || this.height;
      var table = d.createElement('table');
      table.classList.add('universe');
      for (var y = 0; y < height; y++) {
        var row = d.createElement('tr');
        for (var x = 0; x < width; x++) {
          var cellElement = d.createElement('td');
          cellElement.cell = new Cell(x, y, cellElement);
          cellElement.addEventListener('click', cellElement.cell.toggleAlive);
          this.space[y][x] = cellElement.cell;
          row.appendChild(cellElement);
        }
        table.appendChild(row);
      }
      b.appendChild(table);
    };
    this.universe = new Universe();
  };

  GOL.prototype.start = function () {};
  GOL.prototype.stop = function () {};
  GOL.prototype.step = function () {
    var space = this.universe.space;
    for (var x = 0; x < this.universe.width; x++) {
      for (var y = 0; y < this.universe.height; y++) {
        console.log(space[x][y]);
      }
    }
  };

  var gameOfLife = new GOL();
  gameOfLife.universe.create();

})(window);