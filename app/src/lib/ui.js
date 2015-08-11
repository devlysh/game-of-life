/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

(function () {
  var GOL = G.app('gameOfLife');

  GOL.sandbox.add('UI', function () {
    /**
     * @class UI
     * @constructor
     */
    var UI = function () {
      var game = GOL.module('game');
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
        game.save.call(game);
      };

      /**
       * Listener for 'Load' button
       *
       * @function
       */
      this.loadListener = function () {
        game.load.call(game);
      };

      /**
       * Listener for inputs which changes life conditions
       *
       * @function
       * @param event {Event}
       */
      this.changeLifeConditionsListener = function (event) {
        var k, v,
            target = event.target,
            value = target.value;
        if (target.name === 'min-to-live') { k = 'minNeighborsToLive'; v = Number(value); }
        if (target.name === 'max-to-live') { k = 'maxNeighborsToLive'; v = Number(value); }
        if (target.name === 'to-be-born') { k = 'neighborsToBeBorn'; v = Number(value); }
        game.changeLifeConditions.call(game, k, v);
      };

      /**
       * Listener for inputs which changes life conditions
       *
       * @function
       * @param event {Event}
       */
      this.toggleCellListener = function (event) {
        var fullCellWidth = GOL.config.CELL_WIDTH + GOL.config.BORDER_WIDTH,
            fullCellHeight = GOL.config.CELL_HEIGHT + GOL.config.BORDER_WIDTH,
            x = Math.floor((event.layerX - GOL.config.BORDER_WIDTH) / fullCellWidth),
            y = Math.floor((event.layerY - GOL.config.BORDER_WIDTH) / fullCellHeight);
        game.toggleCell.call(game, x, y);
      };
    };
    UI.prototype = {
      /**
       * Returns new universe, game's field
       *
       * @method createUniverse
       * @return {HTMLCanvasElement}
       */
      createUniverse: function () {
        var fullCellWidth, fullCellHeight,
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        fullCellWidth = GOL.config.CELL_WIDTH + GOL.config.BORDER_WIDTH;
        fullCellHeight = GOL.config.CELL_HEIGHT + GOL.config.BORDER_WIDTH;
        canvas.width = GOL.config.UNIVERSE_WIDTH * fullCellWidth + GOL.config.BORDER_WIDTH;
        canvas.height = GOL.config.UNIVERSE_HEIGHT * fullCellHeight + GOL.config.BORDER_WIDTH;
        canvas.classList.add('universe');
        canvas.addEventListener('click', this.toggleCellListener);
        this.universe  = canvas;
        this.universeContext = context;
        return canvas;
      },

      /**
       * Returns menu
       *
       * @method createMenu
       * @return {DocumentFragment} Game menu
       */
      createMenu: function () {
        var menu = document.getElementById('menu-template').content,
            startButton = menu.querySelector('.start-button'),
            stopButton = menu.querySelector('.stop-button'),
            stepButton = menu.querySelector('.step-button'),
            clearButton = menu.querySelector('.clear-button'),
            loadButton = menu.querySelector('.load-button'),
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
        var stepDisplay = document.getElementById('step-display-template').content;
        this.stepDisplayElement = stepDisplay.querySelector('.step-display span');
        return stepDisplay;
      },

      /**
       * Returns input panel for changing game conditions
       *
       * @method createInputPanel
       * @return {DocumentFragment} Block with input panel
       */
      createInputPanel: function () {
        var inputPanel = document.getElementById('input-panel-template').content,
            minToLive = inputPanel.querySelector('.min-to-live'),
            maxToLive = inputPanel.querySelector('.max-to-live'),
            toBeBorn = inputPanel.querySelector('.to-be-born');
        this.minNeighborsToLiveElement = minToLive;
        this.maxNeighborsToLiveElement = maxToLive;
        this.neighborsToBeBornElement = toBeBorn;
        minToLive.addEventListener('input', this.changeLifeConditionsListener);
        maxToLive.addEventListener('input', this.changeLifeConditionsListener);
        toBeBorn.addEventListener('input', this.changeLifeConditionsListener);
        minToLive.value = GOL.config.MIN_NEIGHBORS_TO_LIVE;
        maxToLive.value = GOL.config.MAX_NEIGHBORS_TO_LIVE;
        toBeBorn.value = GOL.config.NEIGHBORS_TO_BE_BORN;
        return inputPanel;
      },

      /**
       * Appends UI to certain element
       *
       * @method appendTo
       * @param element {HTMLElement} Element which append UI to
       */
      appendTo: function (element) {
        var universe = this.createUniverse(),
            menu = this.createMenu(),
            stepDisplay = this.createStepDisplay(),
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
      stepDisplayElement: null,

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
})();