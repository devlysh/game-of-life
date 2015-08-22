define(['../../app/src/lib/cell.js'], function (Cell) {

  describe('Cell', function () {
    var cell, x, y;
    x = 5;
    y = 6;

    beforeEach(function () {
      cell = new Cell(x, y);
    });

    it('should hame "x", "y", "neightborCoordinates" methods', function () {
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
      it('calculate color of cell', function () {
        //TODO: Implement this test
      });
    });

    describe('._detectNeighborsCoordinates method', function () {
      it('should detect neighbors coordinates of current cell', function () {
        //TODO: Implement this test
      });
    });
  });
});