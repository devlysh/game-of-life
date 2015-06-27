(function (w) {

  var d = w.document;
  var b = d.body;

  var DEFAULT_WIDTH = 50;
  var DEFAULT_HEIGHT = 50;
  var DEFAULT_ALIVE = false;

  var GOL = function () {

    var Cell = function () {
      var _alive = DEFAULT_ALIVE;
      Object.defineProperty(this, 'alive', {
        get: function() { return _alive; },
        set: function (value) { _alive = Boolean(value); },
      });
    };

    Cell.prototype.toggleAlive = function (event) {
      if (this.cellData.alive) {
        this.cellData.alive = false;
        this.classList.toggle('alive');
      } else {
        this.cellData.alive = true;
        this.classList.toggle('alive');
      }
    };

    /* UNIVERSE */
    this.Universe = function (x, y) {
      var thisUniverse = this;
      this.width = x || DEFAULT_WIDTH;
      this.height = y || DEFAULT_HEIGHT;

      this.space = (function () {
        var s = new Array(thisUniverse.height);
        for (var c = 0; c < s.length; c++) {
          s[c] = new Array(thisUniverse.width);
        }
        return s;
      })();
    };

    this.Universe.prototype.create = function () {
      var table = d.createElement('table');
      table.classList.add('universe');
      for (var y = 0; y < this.height; y++) {
        var row = d.createElement('tr');
        for (var x = 0; x < this.width; x++) {
          var cell = d.createElement('td');
          cell.cellData = new Cell();
          cell.addEventListener('click', cell.cellData.toggleAlive);
          this.space[y][x] = cell;
          row.appendChild(cell);
        }
        table.appendChild(row);
      }
      b.appendChild(table);
    };
  };

  GOL.prototype.start = function () {};
  GOL.prototype.stop = function () {};
  GOL.prototype.step = function () {};

  var gameOfLife = new GOL();
  var universe = new gameOfLife.Universe();
  universe.create();

})(window);