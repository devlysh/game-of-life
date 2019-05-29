define(['./cell.js'], function (Cell) {

  describe('Cell', function () {
    var cell, x, y;
    x = 5;
    y = 6;

    beforeEach(function () {
      cell = new Cell(x, y);
    });

    it('should have "x", "y", "neightborCoordinates" methods', function () {
      expect(cell.x).toBeDefined();
      expect(cell.y).toBeDefined();
      expect(cell.x).toBe(x);
      expect(cell.y).toBe(y);
      expect(cell.neighborsCoordinates).toBeDefined();
      expect(cell.neighborsCoordinates).toEqual(jasmine.any(Array));
    });

    describe('.revive method', function () {
      it('should revive cell', function () {
        cell.isAlive = false;
        cell.revive();
        expect(cell.isAlive).toBeTruthy();
      });
    });

    describe('.kill method', function () {
      it('should kill cell', function () {
        cell.isAlive = true;
        cell.kill();
        expect(cell.isAlive).toBeFalsy();
      });
    });

    describe('.calculateColor method', function () {
      it('calculates color of cell', function () {
        define(['./constants/config.js'], function (config) {
          cell.revive();
          expect(cell.color).toBe(config.ALIVE_COLOR);
          cell.kill();
          expect(cell.color).toBe(config.DEAD_COLOR);
        });
      });
    });

    describe('._detectNeighborsCoordinates method', function () {
      it('should detect neighbors coordinates of current cell', function () {
        var result;
        result = cell._detectNeighborsCoordinates();
        expect(result).toContain({x: 4, y: 5});
        expect(result).toContain({x: 5, y: 5});
        expect(result).toContain({x: 6, y: 5});
        expect(result).toContain({x: 4, y: 6});
        expect(result).toContain({x: 6, y: 6});
        expect(result).toContain({x: 4, y: 7});
        expect(result).toContain({x: 5, y: 7});
        expect(result).toContain({x: 6, y: 7});
      });
    });
  });
});