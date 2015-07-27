/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @class APP
 * @static
 */

var App = (function () {
  this.GOL = require('./game_of_life');
  this.UI = require('./ui');
  this.Universe = require('./universe');
})();

window.app = (function () {
  var app = {};

  app.config = require('./config');
  GOL = require('./game_of_life', app);
  UI = require('./ui', app);
  Universe = require('./universe', app);

  app.gol = new GOL(app);
  app.ui = new UI(app);
  app.universe = new Universe(app);
  app.gol.init();

  return app;
})();