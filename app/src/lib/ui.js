/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function (require) {
  var config = require('./config.js');

  /**
   * @class UI
   * @constructor
   */
  var UI = function (game) {
    /**
     * Listener for 'Start' button
     *
     * @function
     */
    this.startListener = function () {
      game.start.call(game);
    };

    /**
     * Listener for 'Stop' button
     *
     * @function
     */
    this.stopListener = function () {
      game.stop.call(game);
    };

    /**
     * Listener for 'Step forward' button
     *
     * @function
     */
    this.stepForwardListener = function () {
      game.stepForward.call(game);
    };

    /**
     * Listener for 'Clear' button
     *
     * @function
     */
    this.clearListener = function () {
      game.killAllCells.call(game);
    };

    /**
     * Listener for 'Save' button
     *
     * @function
     */
    this.saveListener = function () {
      game.save.call(game, 'savedGame');
    };

    /**
     * Listener for 'Load' button
     *
     * @function
     */
    this.loadListener = function () {
      game.load.call(game, 'savedGame');
    };

    /**
     * Listener for inputs which changes life conditions
     *
     * @function
     * @param event {Event}
     */
    this.changeLifeConditionsListener = function (event) {
      var k, v, target, value;
      target = event.target;
      value = target.value;
      if (target.name === 'min-to-live') {
        k = 'minNeighborsToLive';
        v = Number(value);
      }
      if (target.name === 'max-to-live') {
        k = 'maxNeighborsToLive';
        v = Number(value);
      }
      if (target.name === 'to-be-born') {
        k = 'neighborsToBeBorn';
        v = Number(value);
      }
      game.changeLifeConditions.call(game, k, v);
    };

    /**
     * Listener for inputs which changes life conditions
     *
     * @function
     * @param event {Event}
     */
    this.toggleCellListener = function (event) {
      var fullCellWidth, fullCellHeight, x, y;
      fullCellWidth = config.CELL_WIDTH + config.BORDER_WIDTH;
      fullCellHeight = config.CELL_HEIGHT + config.BORDER_WIDTH;
      x = Math.floor((event.layerX - config.BORDER_WIDTH) / fullCellWidth);
      y = Math.floor((event.layerY - config.BORDER_WIDTH) / fullCellHeight);
      game.toggleCell.call(game, x, y);
    };
  };

  UI.prototype = {
    /**
     * Returns document fragment by template string
     *
     * @method parseTemplate
     * @param {String} templateStr String template
     * @return {DocumentFragment} DOM fragment parsed from template
     */
    parseTemplate: function (templateStr) {
      var element = document.createElement('template');
      element.innerHTML = templateStr;
      return element.content;
    },

    /**
     * Returns new universe, game's field
     *
     * @method createUniverse
     * @return {HTMLCanvasElement}
     */
    createUniverse: function () {
      var template, foundation, zeroElement, canvas, context, fullCellWidth, fullCellHeight, width, height;
      fullCellWidth = config.CELL_WIDTH + config.BORDER_WIDTH;
      fullCellHeight = config.CELL_HEIGHT + config.BORDER_WIDTH;
      width = config.UNIVERSE_WIDTH * fullCellWidth + config.BORDER_WIDTH;
      height = config.UNIVERSE_HEIGHT * fullCellHeight + config.BORDER_WIDTH;
      template = '' +
        '<table class="wrap">' +
        '  <tr>' +
        '    <td id="zero"></td>' +
        '  </tr>' +
        '</table>';
      foundation = this.parseTemplate(template);
      canvas = document.createElement('canvas');
      canvas.classList.add('universe');
      canvas.addEventListener('click', this.toggleCellListener);
      canvas.width = width;
      canvas.height = height;
      zeroElement = foundation.getElementById('zero');
      zeroElement.appendChild(canvas);
      context = canvas.getContext('2d');
      this.universe = canvas;
      this.universeContext = context;
      return foundation;
    },

    /**
     * Returns menu
     *
     * @method createMenu
     * @return {DocumentFragment} Game menu
     */
    createMenu: function () {
      var menu, template, startButton, stopButton, stepButton, clearButton, loadButton, saveButton, menuTemplateString;
      template = '' +
        '<div class="menu">' +
        '  <button class="button start-button">START</button>' +
        '  <button class="button stop-button">STOP</button>' +
        '  <button class="button step-button">NEXT STEP</button>' +
        '  <button class="button clear-button">CLEAR</button>' +
        '  <button class="button load-button">LOAD</button>' +
        '  <button class="button save-button">SAVE</button>' +
        '</div>';
      menu = this.parseTemplate(template);
      startButton = menu.querySelector('.start-button');
      stopButton = menu.querySelector('.stop-button');
      stepButton = menu.querySelector('.step-button');
      clearButton = menu.querySelector('.clear-button');
      loadButton = menu.querySelector('.load-button');
      saveButton = menu.querySelector('.save-button');
      startButton.addEventListener('click', this.startListener);
      stopButton.addEventListener('click', this.stopListener);
      stepButton.addEventListener('click', this.stepForwardListener);
      clearButton.addEventListener('click', this.clearListener);
      loadButton.addEventListener('click', this.loadListener);
      saveButton.addEventListener('click', this.saveListener);
      return menu;
    },

    /**
     * Returns display for game steps
     *
     * @method createStepDisplay
     * @return {DocumentFragment} Block with step display
     */
    createStepDisplay: function () {
      var stepDisplay, stepDisplayElement;
      stepDisplayElement = document.createElement('template');
      stepDisplayElement.innerHTML = '' +
        '<div class="step-display">' +
        '  <span>0</span>' +
        '</div>';
      stepDisplay = stepDisplayElement.content;
      this.stepDisplaySpot = stepDisplay.querySelector('.step-display span');
      return stepDisplay;
    },

    /**
     * Returns input panel for changing game conditions
     *
     * @method createInputPanel
     * @return {DocumentFragment} Block with input panel
     */
    createInputPanel: function () {
      var inputPanel, template, minToLiveElement, maxToLiveElement, toBeBornElement;
      template = '' +
        '<div class="input-panel">' +
        '  <div class="wrap">' +
        '    <div class="input-block">' +
        '      <span class="value">2</span>' +
        '      <input class="min-to-live" type="range" min="0" max="8" name="min-to-live">' +
        '      <span class="description">MIN neighbours to LIVE</span>' +
        '    </div>' +
        '    <div class="input-block">' +
        '      <span class="value">3</span>' +
        '      <input class="max-to-live" type="range" min="0" max="8" name="max-to-live">' +
        '      <span class="description">MAX neighbours to LIVE</span>' +
        '    </div>' +
        '    <div class="input-block">' +
        '      <span class="value">3</span>' +
        '      <input class="to-be-born" type="range" min="0" max="8" name="to-be-born">' +
        '      <span class="description">N neighbours to BE BORN</span>' +
        '    </div>' +
        '    <div class="clear"></div>' +
        '  </div>' +
        '</div>';
      inputPanel = this.parseTemplate(template);
      minToLiveElement = inputPanel.querySelector('.min-to-live');
      maxToLiveElement = inputPanel.querySelector('.max-to-live');
      toBeBornElement = inputPanel.querySelector('.to-be-born');
      minToLiveElement.addEventListener('input', this.changeLifeConditionsListener);
      maxToLiveElement.addEventListener('input', this.changeLifeConditionsListener);
      toBeBornElement.addEventListener('input', this.changeLifeConditionsListener);
      minToLiveElement.value = config.MIN_NEIGHBORS_TO_LIVE;
      maxToLiveElement.value = config.MAX_NEIGHBORS_TO_LIVE;
      toBeBornElement.value = config.NEIGHBORS_TO_BE_BORN;
      this.minNeighborsToLiveElement = minToLiveElement;
      this.maxNeighborsToLiveElement = maxToLiveElement;
      this.neighborsToBeBornElement = toBeBornElement;
      return inputPanel;
    },

    /**
     * Appends UI to certain element
     *
     * @method appendTo
     * @param element {HTMLElement} Element which append UI to
     */
    appendTo: function (element) {
      var universe, menu, stepDisplay, inputPanel;
      universe = this.createUniverse();
      menu = this.createMenu();
      stepDisplay = this.createStepDisplay();
      inputPanel = this.createInputPanel();
      element.appendChild(universe);
      element.appendChild(stepDisplay);
      element.appendChild(inputPanel);
      element.appendChild(menu);
    },

    /**
     * Link to step display element
     *
     * @property stepDisplayElement
     * @type HTMLElement
     */
    stepDisplaySpot: null,

    /**
     * Minimum neighbors amount of cell to live
     *
     * @property minNeighborsToLiveElement
     * @type HTMLElement
     */
    minNeighborsToLiveElement: null,

    /**
     * Maximum neighbors amount of cell to live
     *
     * @property maxNeighborsToLiveElement
     * @type HTMLElement
     */
    maxNeighborsToLiveElement: null,

    /**
     * Count of neighbors of cell to be born
     *
     * @property neighborsToBeBornElement
     * @type HTMLElement
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
     * @type CanvasRenderingContext2D
     */
    universeContext: null
  };

  return UI;
});