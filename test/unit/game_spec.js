define(['../../app/src/lib/game.js'], function (Game) {

  describe('Game', function () {
    var game;

    beforeEach(function () {
      game = new Game();
      game.init();
    });

    describe('.forEachCell method', function () {
      it('makes logic from callback function for each cell in universe', function () {
        var x, y, cell, width, height, space, test, worksFine;
        width = game.universe.width;
        height = game.universe.height;
        space = game.universe.space;
        test = 'test';
        worksFine = true;
        for (x = 0; x < width; x++) {
          for (y = 0; y < height; y++) {
            cell = space[x][y];
            cell[test] = test;
          }
        }
        game.forEachCell(function (cell) {
          if (!cell[test] === test) {
            worksFine = false;
          }
        });
        expect(worksFine).toBeTruthy();
      })
    });

    describe('.toLocaleString method', function () {
      it('converts universe to plain object with live cells coordinates', function () {
        var string, loaded, x, y, step;
        x = 3;
        y = 4;
        step = 500;
        game.universe.space[x][y].revive();
        game.step = step;
        string = game.toLocaleString();
        game.load();
        loaded = JSON.parse(string);
        expect(typeof string).toBe('string');
        expect(loaded.space).toBeDefined();
        expect(loaded.step).toBeDefined();
        expect(loaded.space[0].x).toBe(x);
        expect(loaded.space[0].y).toBe(y);
        expect(loaded.step).toBe(step);
      });
    });

    describe('.init method', function () {
      it('initiates game', function () {
        expect(game.init).toBeDefined();
      });
    });

    describe('.start method', function () {
      it('starts game steps continuation', function () {
        spyOn(window, 'setInterval');
        game.start();
        expect(window.setInterval).toHaveBeenCalledWith(game.stepForward, game.timeInterval);
      });
    });

    describe('.stop method', function () {
      it('stops game steps continuation', function () {
        var intervalID;
        spyOn(window, 'clearInterval').and.callThrough();
        game.start();
        intervalID = game.intervalID;
        game.stop();
        expect(game.intervalID).toBeNull();
        expect(window.clearInterval).toHaveBeenCalledWith(intervalID);
      });
    });

    describe('.stepForward method', function () {
      it('commits next step', function () {
        spyOn(game, 'calculateNextStep');
        spyOn(game, 'forEachCell');
        spyOn(game, 'setStepCounter');
        spyOn(game, 'render');
        game.stepForward();
        expect(game.calculateNextStep).toHaveBeenCalled();
        expect(game.forEachCell).toHaveBeenCalled();
        expect(game.setStepCounter).toHaveBeenCalled();
        expect(game.render).toHaveBeenCalled();
      });
    });

    describe('.save method', function () {
      it('saves game to localStorage', function () {
        var name, savedGame, stringifiedGame;
        name = 'someName';
        game.save(name);
        savedGame = localStorage.getItem(name);
        stringifiedGame = game.toLocaleString();
        expect(savedGame).toBeDefined();
        expect(savedGame).toBe(stringifiedGame);
      });
    });

    describe('.load method', function () {
      var name, firstGame;
      name = 'someName';

      beforeEach(function () {
        game.universe.space[3][6].revive();
        game.universe.space[3][10].revive();
        game.universe.space[13][15].revive();
        firstGame = game.toLocaleString();
        game.save(name);
        game.killAllCells();
      });

      it('loads default game if it is called without params', function () {
        define(['../../app/src/lib/default_game.js'], function (defaultGame) {
          var loadedGame;
          game.load();
          loadedGame = game.toLocaleString();
          expect(defaultGame).toBe(loadedGame);
        });
      });

      it('loads game with given name from localStorage', function () {
        var secondGame;
        game.load(name);
        secondGame = game.toLocaleString();
        expect(firstGame).toBe(secondGame);
      });
    });
    
    describe('.toggleCell method', function () {
      it('toggles cell from alive to dead and inside out', function () {
        var x, y, cell, status;
        x = 3;
        y = 4;
        cell = game.universe.space[x][y];
        status = cell.isAlive;
        game.toggleCell(x, y);
        expect(cell.isAlive).toBe(!status);
        game.toggleCell(x, y);
        expect(cell.isAlive).toBe(status);
      });
    });
  });
});

