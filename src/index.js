/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @namespace window
 * @property app
 */
window.app = (function () {
  var GOL, UI, Universe,
      app = {};

  app.config = require('./config');
  GOL = require('./game_of_life', app);
  UI = require('./ui', app);
  Universe = require('./universe', app);

  app.gol = new GOL();
  app.ui = new UI();
  app.universe = new Universe();
  app.gol.init();

  return app;
})();