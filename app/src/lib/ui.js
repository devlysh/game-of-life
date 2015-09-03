/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(function (require) {
  var game, config = require('./config.js');

  /**
   * Listener for keyboard
   *
   * @function
   */
  function keyboardListener(event) {
    switch (event.keyCode) {
      case config.keys.space:
        if (event.shiftKey) {
          stopGame();
          stepForwardListener();
        } else {
          toggleGameListener();
        }
        break;
      case config.keys.q:
        game.changeLifeConditions('minNeighborsToLive', 0);
        break;
      case config.keys.w:
        game.changeLifeConditions('minNeighborsToLive', 1);
        break;
      case config.keys.e:
        game.changeLifeConditions('minNeighborsToLive', 2);
        break;
      case config.keys.r:
        game.changeLifeConditions('minNeighborsToLive', 3);
        break;
      case config.keys.t:
        game.changeLifeConditions('minNeighborsToLive', 4);
        break;
      case config.keys.y:
        game.changeLifeConditions('minNeighborsToLive', 5);
        break;
      case config.keys.u:
        game.changeLifeConditions('minNeighborsToLive', 6);
        break;
      case config.keys.i:
        game.changeLifeConditions('minNeighborsToLive', 7);
        break;
      case config.keys.o:
        game.changeLifeConditions('minNeighborsToLive', 8);
        break;
      case config.keys.a:
        game.changeLifeConditions('maxNeighborsToLive', 0);
        break;
      case config.keys.s:
        game.changeLifeConditions('maxNeighborsToLive', 1);
        break;
      case config.keys.d:
        game.changeLifeConditions('maxNeighborsToLive', 2);
        break;
      case config.keys.f:
        game.changeLifeConditions('maxNeighborsToLive', 3);
        break;
      case config.keys.g:
        game.changeLifeConditions('maxNeighborsToLive', 4);
        break;
      case config.keys.h:
        game.changeLifeConditions('maxNeighborsToLive', 5);
        break;
      case config.keys.j:
        game.changeLifeConditions('maxNeighborsToLive', 6);
        break;
      case config.keys.k:
        game.changeLifeConditions('maxNeighborsToLive', 7);
        break;
      case config.keys.l:
        game.changeLifeConditions('maxNeighborsToLive', 8);
        break;
      case config.keys.z:
        game.changeLifeConditions('neighborsToBeBorn', 0);
        break;
      case config.keys.x:
        game.changeLifeConditions('neighborsToBeBorn', 1);
        break;
      case config.keys.c:
        game.changeLifeConditions('neighborsToBeBorn', 2);
        break;
      case config.keys.v:
        game.changeLifeConditions('neighborsToBeBorn', 3);
        break;
      case config.keys.b:
        game.changeLifeConditions('neighborsToBeBorn', 4);
        break;
      case config.keys.n:
        game.changeLifeConditions('neighborsToBeBorn', 5);
        break;
      case config.keys.m:
        game.changeLifeConditions('neighborsToBeBorn', 6);
        break;
      case config.keys.comma:
        game.changeLifeConditions('neighborsToBeBorn', 7);
        break;
      case config.keys.period:
        game.changeLifeConditions('neighborsToBeBorn', 8);
        break;
    }
  }

  /**
   * Starts game
   *
   * @function
   */
  function startGame() {
    game.start();
    game.ui.startButtonElement.classList.add('excluded');
    game.ui.stopButtonElement.classList.remove('excluded');
  }

  /**
   * Stops game
   *
   * @function
   */
  function stopGame() {
    game.stop();
    game.ui.startButtonElement.classList.remove('excluded');
    game.ui.stopButtonElement.classList.add('excluded');
  }

  /**
   * Listener for 'Start' and 'Stop' button
   *
   * @function
   */
  function toggleGameListener() {
    if (game.inAnimation) {
      stopGame();
    } else {
      startGame();
    }
    this.blur();
  }

  /**
   * Listener for 'Step forward' button
   *
   * @function
   */
  function stepForwardListener() {
    game.stepForward();
    this.blur();
  }

  /**
   * Listener for 'Clear' button
   *
   * @function
   */
  function clearListener() {
    game.killAllCells();
    this.blur();
  }

  /**
   * Listener for 'Save' button
   *
   * @function
   */
  function saveListener() {
    game.save.call(game, 'savedGame');
    this.blur();
  }

  /**
   * Listener for 'Load' button
   *
   * @function
   */
  function loadListener() {
    game.load.call(game, 'savedGame');
    this.blur();
  }

  /**
   * Listener for inputs which changes life conditions
   *
   * @function
   * @param event {Event}
   */
  function changeLifeConditionsListener(event) {
    var k, v, target, value;
    target = event.target;
    value = target.value;
    switch (target.name) {
      case 'min-to-live':
        k = 'minNeighborsToLive';
        v = Number(value);
        break;
      case 'max-to-live':
        k = 'maxNeighborsToLive';
        v = Number(value);
        break;
      case 'to-be-born':
        k = 'neighborsToBeBorn';
        v = Number(value);
        break;
    }
    game.changeLifeConditions.call(game, k, v);
  }

  /**
   * Listener for inputs which changes life conditions
   *
   * @function
   * @param event {Event}
   */
  function toggleCellListener(event) {
    var fullCellWidth, fullCellHeight, x, y;
    fullCellWidth = config.CELL_WIDTH + config.BORDER_WIDTH;
    fullCellHeight = config.CELL_HEIGHT + config.BORDER_WIDTH;
    x = Math.floor((event.layerX - config.BORDER_WIDTH) / fullCellWidth);
    y = Math.floor((event.layerY - config.BORDER_WIDTH) / fullCellHeight);
    game.toggleCell.call(game, x, y);
  }

  /**
   * @class UI
   * @constructor
   */
  var UI = function (g) {
    game = g;
  };

  UI.prototype = {

    /**
     * Returns document fragment by template string
     *
     * @method parseTemplate
     * @param {String} str String template
     * @return {DocumentFragment} DOM fragment parsed from string template
     */
    parseTemplate: function (str) {
      var element = document.createElement('template');
      element.innerHTML = str;
      return element.content;
    },

    /**
     * Returns new canvas, game's field
     *
     * @method createUniverse
     * @return {HTMLCanvasElement}
     */
    createUniverse: function () {
      var template, foundation, zeroElement, canvas, canvasContext, fullCellWidth, fullCellHeight, width, height;
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
      canvas.addEventListener('click', toggleCellListener);
      canvas.width = width;
      canvas.height = height;
      zeroElement = foundation.getElementById('zero');
      zeroElement.appendChild(canvas);
      canvasContext = canvas.getContext('2d');
      this.canvas = canvas;
      this.canvasContext = canvasContext;
      return foundation;
    },

    /**
     * Returns menu
     *
     * @method createButtonsMenu
     * @return {DocumentFragment} Game menu
     */
    createButtonsMenu: function () {
      var menu, template, startButton, stepButton, clearButton, loadButton, saveButton;
      template = '' +
        '<div class="menu">' +
        '  <button class="button start-button">start</button>' +
        '  <button class="button stop-button excluded">stop</button>' +
        '  <button class="button step-button">next step</button>' +
        '  <button class="button clear-button">clear</button>' +
        '  <button class="button load-button">load</button>' +
        '  <button class="button save-button">save</button>' +
        '</div>';
      menu = this.parseTemplate(template);
      startButton = menu.querySelector('.start-button');
      stopButton = menu.querySelector('.stop-button');
      stepButton = menu.querySelector('.step-button');
      clearButton = menu.querySelector('.clear-button');
      loadButton = menu.querySelector('.load-button');
      saveButton = menu.querySelector('.save-button');
      startButton.addEventListener('click', toggleGameListener);
      stopButton.addEventListener('click', toggleGameListener);
      stepButton.addEventListener('click', stepForwardListener);
      clearButton.addEventListener('click', clearListener);
      loadButton.addEventListener('click', loadListener);
      saveButton.addEventListener('click', saveListener);
      this.startButtonElement = startButton;
      this.stopButtonElement = stopButton;
      return menu;
    },

    /**
     * Binds keys
     *
     * @method bindKeys
     */
    bindKeys: function () {
      document.body.addEventListener('keypress', keyboardListener);
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
      //TODO: Implement cool inputs
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
      minToLiveElement.addEventListener('input', changeLifeConditionsListener);
      maxToLiveElement.addEventListener('input', changeLifeConditionsListener);
      toBeBornElement.addEventListener('input', changeLifeConditionsListener);
      minToLiveElement.value = config.MIN_NEIGHBORS_TO_LIVE;
      maxToLiveElement.value = config.MAX_NEIGHBORS_TO_LIVE;
      toBeBornElement.value = config.NEIGHBORS_TO_BE_BORN;
      this.minNeighborsToLiveElement = minToLiveElement;
      this.maxNeighborsToLiveElement = maxToLiveElement;
      this.neighborsToBeBornElement = toBeBornElement;
      this.bindKeys();
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
      menu = this.createButtonsMenu();
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
     * Button which starts game
     *
     * @property startButtonElement
     * @type HTMLElement
     */
    startButtonElement: null,

    /**
     * Button which stops game
     *
     * @property stopButtonElement
     * @type HTMLElement
     */
    stopButtonElement: null,

    /**
     * Link to canvas element
     *
     * @property canvas
     * @type HTMLCanvasElement
     */
    canvas: null,

    /**
     * Context of canvas element
     *
     * @property canvasContext
     * @type CanvasRenderingContext2D
     */
    canvasContext: null
  };

  return UI;
});