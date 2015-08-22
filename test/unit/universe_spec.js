define(['../../app/src/lib/universe.js'], function (Universe) {

  describe('Universe', function () {
    var universe;

    beforeEach(function () {
      universe = new Universe();
    });

    it('should have "width", "height", "space" properties', function () {
      expect(universe.width).toBeDefined();
      expect(universe.height).toBeDefined();
      expect(universe.space).toBeDefined();
    });

    describe('._createSpace method', function () {
      it('creates blank space with given width and height', function () {
        var space, width, height;
        width = 100;
        height = 150;
        space = universe._createSpace(width, height);
        expect(space.length).toBe(width);
        expect(space[0].length).toBe(height)
      });
    });
  });
});
