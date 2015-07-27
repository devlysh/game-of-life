/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

/**
 * @module app
 * @submodule ui
 */
define(function (app) {

  /**
   * Listener for 'Start' button
   */
  function startListener () {
    app.gol.start.call(app.gol);
  }

  /**
   * Listener for 'Stop' button
   */
  function stopListener () {
    app.gol.stop.call(app.gol);
  }

  /**
   * Listener for 'Step forward' button
   */
  function stepForwardListener () {
    app.gol.stepForward.call(app.gol);
  }

  /**
   * Listener for 'Clear' button
   */
  function clearListener () {
    app.gol.killAllCells.call(app.gol);
  }

  /**
   * Listener for 'Save' button
   */
  function saveListener () {
    app.gol.save.call(app.gol);
  }

  /**
   * Listener for 'Load' button
   */
  function loadListener () {
    app.gol.load.call(app.gol);
  }

  /**
   * Listener for inputs which changes life conditions
   *
   * @param {Event}
   */
  function changeLifeConditionsListener (event) {
    var k, v,
        target = event.target,
        value = target.value;
    if (target.name === 'min-to-live') { k = 'minNeighborsToLive'; v = Number(value); }
    if (target.name === 'max-to-live') { k = 'maxNeighborsToLive'; v = Number(value); }
    if (target.name === 'to-be-born') { k = 'neighborsToBeBorn'; v = Number(value); }
    app.gol.changeLifeConditions.call(app.gol, k, v);
  }

  /**
   * Listener for inputs which changes life conditions
   *
   * @param {Event}
   */
  function toggleCellListener (event) {
    var fullCellWidth = app.config.CELL_WIDTH + app.config.BORDER_WIDTH,
        fullCellHeight = app.config.CELL_HEIGHT + app.config.BORDER_WIDTH,
        x = Math.floor((event.layerX - app.config.BORDER_WIDTH) / fullCellWidth),
        y = Math.floor((event.layerY - app.config.BORDER_WIDTH) / fullCellHeight);
    app.gol.toggleCell.call(app.gol, x, y);
  }

  /**
   * @class UI
   * @constructor
   */
  var UI = function () {};
  UI.prototype = {
    /**
     * Returns new universe, game's field
     *
     * @method createUniverse
     * @return {HTMLCanvasElement}
     */
    createUniverse: function () {
      var i, j, fullCellWidth, fullCellHeight,
          canvas = document.createElement('canvas'),
          context = canvas.getContext('2d');
      fullCellWidth = app.config.CELL_WIDTH + app.config.BORDER_WIDTH;
      fullCellHeight = app.config.CELL_HEIGHT + app.config.BORDER_WIDTH;
      canvas.width = app.config.UNIVERSE_WIDTH * fullCellWidth + app.config.BORDER_WIDTH;
      canvas.height = app.config.UNIVERSE_HEIGHT * fullCellHeight + app.config.BORDER_WIDTH;
      canvas.classList.add('universe');
      canvas.addEventListener('click', toggleCellListener);
      this.universe  = canvas;
      this.universeContext = context;
      return canvas;
    },

    /**
     * Returns menu
     *
     * @method createMenu
     * @return {DocumentFragment} game menu
     */
    createMenu: function () {
      var menu = document.getElementById('menu-template').content,
          startButton = menu.querySelector('.start-button'),
          stopButton = menu.querySelector('.stop-button'),
          stepButton = menu.querySelector('.step-button'),
          clearButton = menu.querySelector('.clear-button'),
          loadButton = menu.querySelector('.load-button'),
          saveButton = menu.querySelector('.save-button');
      startButton.addEventListener('click', startListener);
      stopButton.addEventListener('click', stopListener);
      stepButton.addEventListener('click', stepForwardListener);
      clearButton.addEventListener('click', clearListener);
      loadButton.addEventListener('click', loadListener);
      saveButton.addEventListener('click', saveListener);
      return menu;
    },

    /**
     * Returns display for game steps
     *
     * @method createStepDisplay
     * @return {DocumentFragment} block with step display
     */
    createStepDisplay: function () {
      var stepDisplay = document.getElementById('step-display-template').content;
      this.stepDisplayElement = stepDisplay.querySelector('.step-display span');
      return stepDisplay;
    },

    /**
     * Returns input panel for changing game conditions
     *
     * @method createInputPanel
     * @return {DocumentFragment} block with input panel
     */
    createInputPanel: function () {
      var inputPanel = document.getElementById('input-panel-template').content,
          minToLive = inputPanel.querySelector('.min-to-live'),
          maxToLive = inputPanel.querySelector('.max-to-live'),
          toBeBorn = inputPanel.querySelector('.to-be-born');
      this.minNeighborsToLiveElement = minToLive;
      this.maxNeighborsToLiveElement = maxToLive;
      this.neighborsToBeBornElement = toBeBorn;
      minToLive.addEventListener('input', changeLifeConditionsListener);
      maxToLive.addEventListener('input', changeLifeConditionsListener);
      toBeBorn.addEventListener('input', changeLifeConditionsListener);
      minToLive.value = app.config.MIN_NEIGHBORS_TO_LIVE;
      maxToLive.value = app.config.MAX_NEIGHBORS_TO_LIVE;
      toBeBorn.value = app.config.NEIGHBORS_TO_BE_BORN;
      return inputPanel;
    },

    /**
     * Appends UI to certain element
     *
     * @method appendTo
     * @param {HTMLElement} element which append UI to
     */
    appendTo: function (element) {
      var universe = app.ui.createUniverse(),
          menu = app.ui.createMenu(),
          stepDisplay = app.ui.createStepDisplay(),
          inputPanel = app.ui.createInputPanel();
      element.appendChild(universe);
      element.appendChild(stepDisplay);
      element.appendChild(inputPanel);
      element.appendChild(menu);
    },

    /**
     * Link to step display element
     *
     * @property stepDisplayElement
     * @type {HTMLElement}
     */
    stepDisplayElement: null,

    /**
     * Minimum neighbors amount of cell to live
     *
     * @property minNeighborsToLiveElement
     * @type {HTMLElement}
     */
    minNeighborsToLiveElement: null,

    /**
     * Maximum neighbors amount of cell to live
     *
     * @property maxNeighborsToLiveElement
     * @type {HTMLElement}
     */
    maxNeighborsToLiveElement: null,

    /**
     * Count of neighbors of cell to be born
     *
     * @property neighborsToBeBornElement
     * @type {HTMLElement}
     */
    neighborsToBeBornElement: null,

    /**
     * Link to canvas element
     *
     * @property universe
     * @type {HTMLCanvasElement}
     */
    universe: null,

    /**
     * Context of canvas element
     *
     * @property universeContext
     * @type {CanvasRenderingContext2D}
     */
    universeContext: null
  };

  return UI;
});