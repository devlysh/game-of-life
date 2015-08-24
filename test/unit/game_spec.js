define(['../../app/src/lib/game.js'], function (Game) {

  describe('Game', function () {
    var game;

    beforeEach(function () {
      game = new Game();
      game.init();
    });

    describe('.init method', function () {
      it('initiates game', function () {
        spyOn(game.ui, 'appendTo');
        spyOn(game, 'load');
        game.init();
        expect(game.ui.appendTo).toHaveBeenCalledWith(jasmine.any(HTMLElement));
        expect(game.load).toHaveBeenCalled();
      });
    });

    describe('.forEachCell method', function () {
      it('makes logic from callback function for each cell in space', function () {
        var x, y, cell, width, height, space, test, worksFine;
        width = game.universe.width;
        height = game.universe.height;
        space = game.universe.space;
        test = 'test';
        worksFine = true;
        game.forEachCell(function (cell) {
          cell[test] = test;
        });
        for (x = 0; x < width; x++) {
          for (y = 0; y < height; y++) {
            cell = space[x][y];
            if (!cell[test] || cell[test] !== test) {
              worksFine = false;
            }
          }
        }
        expect(worksFine).toBeTruthy();
      })
    });

    describe('.killAllCells method', function () {
      it('kills all cells in canvas', function () {
        var allCellsAreDead, x, y;
        x = 3;
        y = 4;
        game.universe.space[x][y].revive();
        game.killAllCells();
        allCellsAreDead = true;
        game.forEachCell(function (cell) {
          if (cell.isAlive) {
            allCellsAreDead = false;
          }
        });
        expect(allCellsAreDead).toBeTruthy();
      });
    });

    describe('.toLocaleString method', function () {
      it('converts canvas to plain object with coordinates of alive cells', function () {
        var string, loadedGame, x, y, step;
        x = 3;
        y = 4;
        step = 500;
        game.killAllCells();
        game.universe.space[x][y].revive();
        game.step = step;
        string = game.toLocaleString();
        loadedGame = JSON.parse(string);
        expect(typeof string).toBe('string');
        expect(loadedGame.space).toBeDefined();
        expect(loadedGame.step).toBeDefined();
        expect(loadedGame.space[0].x).toBe(x);
        expect(loadedGame.space[0].y).toBe(y);
        expect(loadedGame.step).toBe(step);
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
        expect(game.forEachCell).toHaveBeenCalledWith(jasmine.any(Function));
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

    describe('.calculateNextStep method', function () {
      it('calculates next step', function () {
        spyOn(game, 'forEachCell').and.callThrough();
        spyOn(game, 'calculateAliveNeighborsOf');
        game.calculateNextStep();
        expect(game.forEachCell).toHaveBeenCalledWith(jasmine.any(Function));
        expect(game.calculateAliveNeighborsOf).toHaveBeenCalled();
      });
    });

    describe('.calculateAliveNeighborsOf method', function () {
      it('calculates alive neighbors of any cell', function () {
        var cell1, cell2;
        cell1 = game.universe.space[5][5];
        cell2 = game.universe.space[15][5];
        game.killAllCells();
        game.universe.space[4][5].revive();
        game.universe.space[4][4].revive();
        game.universe.space[5][4].revive();
        game.universe.space[5][6].revive();
        game.universe.space[14][5].revive();
        game.universe.space[14][4].revive();
        game.universe.space[15][4].revive();
        game.universe.space[15][6].revive();
        game.universe.space[16][5].revive();
        expect(game.calculateAliveNeighborsOf(cell1)).toBe(4);
        expect(game.calculateAliveNeighborsOf(cell2)).toBe(5);
      });
    });

    describe('.setStepCounter method', function () {
      it('sets step counter', function () {
        var test = 500;
        game.setStepCounter(test);
        expect(game.step).toBe(test);
        expect(game.ui.stepDisplaySpot.innerHTML).toBe(test.toString());
      });
    });

    describe('.render method', function () {
      it('renders game to canvas', function () {
        spyOn(game, 'forEachCell').and.callThrough();
        game.render();
        expect(game.forEachCell).toHaveBeenCalled();
      });
    });
  });
});

