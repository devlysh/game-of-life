/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

window.gol = (function() {
  var GOL = G.app('gameOfLife');

  GOL.createModule('game', GOL.sandbox.get('Game'));
  GOL.createModule('ui', GOL.sandbox.get('UI'));
  GOL.createModule('universe', GOL.sandbox.get('Universe'));

  GOL.module('game').init();
  return GOL;
})();