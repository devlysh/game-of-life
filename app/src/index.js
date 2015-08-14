/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

window.gol = (function() {
  var gol = G.app('gameOfLife');

  gol.createModule('game', gol.sandbox.get('Game'));
  gol.createModule('ui', gol.sandbox.get('UI'));
  gol.createModule('universe', gol.sandbox.get('Universe'));

  gol.sandbox.remove('Game');
  gol.sandbox.remove('UI');
  gol.sandbox.remove('Universe');
  gol.sandbox.remove('Cell');

  gol.module('game').init();
  return gol;
})();