/*
 * Game of Life implementation using vanilla JavaScript
 * Copyright (C) Artem Devlysh, 2015
 */

define(['./config.js', './default-game.js', './universe.js', './ui.js'], function (config, defaultGame, Universe, UI) {
    'use strict';

    /**
     * @class Game
     * @constructor
     */
    function Game() {
        this.ui = new UI(this);
        this.universe = new Universe();
    }

    /**
     * @property conditions
     * @type Object
     */
    Game.prototype.conditions = {
        /**
         * @property minNeighborsToLive
         * @type Number
         * @default 2
         */
        minNeighborsToLive: config.MIN_NEIGHBORS_TO_LIVE,

        /**
         * @property maxNeighborsToLive
         * @type Number
         * @default 3
         */
        maxNeighborsToLive: config.MAX_NEIGHBORS_TO_LIVE,

        /**
         * @property neighborsToBeBorn
         * @type Number
         * @default 3
         */
        neighborsToBeBorn: config.NEIGHBORS_TO_BE_BORN
    };

    /**
     * @property rAFID
     * @type Number
     */
    Game.prototype.rAFID = null;

    /**
     * @property step
     * @type Number
     */
    Game.prototype.step = 0;

    /**
     * @property inAnimation
     * @type Boolean
     */
    Game.prototype.inProgress = false;

    /**
     * Initiates Game Of Life
     *
     * @method init
     */
    Game.prototype.init = init;
    function init() {
        this.ui.appendTo(document.body);
        this.load();
    }


    /**
     * Starts step continuation
     *
     * @method start
     */
    Game.prototype.start = start;
    function start() {
        if (!this.inProgress) {
            this.rAFID = requestAnimationFrame(_stepForward.bind(this));
            this.inProgress = true;
        }
    }

    /**
     * Stops step continuation
     *
     * @method stop
     */
    Game.prototype.stop = stop;
    function stop() {
        if (this.inProgress) {
            cancelAnimationFrame(this.rAFID);
            this.rAFID = null;
            this.inProgress = false;
        }
    }

    /**
     * Saves game to LocalStorage
     *
     * @method save
     */
    Game.prototype.save = save;
    function save(name) {
        localStorage.setItem(name, _toString());
    }

    /**
     * Loads game from LocalStorage
     *
     * @method load
     * @param name {String} Name of game to load
     */
    Game.prototype.load = load;
    function load(name) {
        var data, loadedGame;
        data = name ? localStorage.getItem(name) : defaultGame;
        if (data) {
            loadedGame = JSON.parse(data);
            this.killAllCells();
            _setStepCounter.call(this, loadedGame.step);
            loadedGame.space.forEach(function (cell) {
                this.universe.space[cell.x][cell.y].revive();
            }.bind(this));
            _forEachCell.call(this, _render);
        } else {
            throw Error('Could not load game');
        }
    }

    /**
     * Toggles cell from alive to dead or inside out
     *
     * @method toggleCell
     * @param x {Number} X coordinate of cell
     * @param y {Number} Y coordinate of cell
     */
    Game.prototype.toggleCell = toggleCell;
    function toggleCell(x, y) {
        var cell = this.universe.space[x][y];
        if (cell.isAlive) {
            cell.kill();
        } else {
            cell.revive();
        }
        _forEachCell.call(this, _calculateNextStep);
        _forEachCell.call(this, _render);
    }

    /**
     * Kills all cells, updated counter, commits render
     *
     * @method killAllCells
     */
    Game.prototype.killAllCells = killAllCells;
    function killAllCells() {
        _forEachCell.call(this, function (cell) {
            cell.kill();
            cell.willLiveNextStep = null;
        });
        _setStepCounter.call(this, 0);
        _forEachCell.call(this, _render);
    }

    /**
     * Changes life conditions
     *
     * @method changeLifeConditions
     * @param condition {String} Condition to change
     * @param value {Number} Value of changed condition
     */
    Game.prototype.changeLifeConditions = changeLifeConditions;
    function changeLifeConditions(condition, value) {
        this.ui[condition + 'Element'].value = value;
        this.ui[condition + 'Element'].parentElement.querySelector('span').innerHTML = value;
        this.conditions[condition] = value;
        _forEachCell.call(this, _calculateNextStep);
    }

    /**
     * Makes one single step
     *
     * @method stepOnce
     */
    Game.prototype.stepOnce = stepOnce;
    function stepOnce() {
        _setStepCounter.call(this, this.step + 1);
        _forEachCell.call(this, _calculateNextStep);
        _forEachCell.call(this, _resolveRound);
        _forEachCell.call(this, _render);
    }

    /**
     * Kills, revives cells and sets counters
     *
     * @method stepForward
     * @private
     */
    function _stepForward() {
        this.rAFID = requestAnimationFrame(_stepForward.bind(this));
        _setStepCounter.call(this, this.step + 1);
        _forEachCell.call(this, _calculateNextStep);
        _forEachCell.call(this, _resolveRound);
        _forEachCell.call(this, _render);
    }

    /**
     * Makes some logic from callback function for each cell
     *
     * @method forEachCell
     * @private
     * @param {Game~ForEachCellCb} callback Callback function for each cell
     */
    function _forEachCell(callback) {
        var x, y, cell,
            width = this.universe.width,
            height = this.universe.height,
            space = this.universe.space;
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                cell = space[x][y];
                /**
                 * Called for each cell
                 *
                 * @callback Game~ForEachCellCb
                 * @param {Cell} cell Cell in canvas
                 */
                callback.call(this, cell);
            }
        }
    }

    /**
     * @method toString
     * @private
     * @return {string} Stringified array of data with alive cells coordinates and step count
     */
    function _toString() {
        var result, plainSpace;
        result = {};
        plainSpace = [];
        _forEachCell.call(this, function (cell) {
            if (cell.isAlive) {
                plainSpace.push({
                    x: cell.x,
                    y: cell.y
                });
            }
        });
        result.space = plainSpace;
        result.step = this.step;
        result = JSON.stringify(result);
        return result;
    }

    /**
     * @method resolveRound
     * @param cell
     * @private
     */
    function _resolveRound(cell) {
        if (!cell.isAlive && cell.willLiveNextStep) {
            cell.revive();
        } else if (cell.isAlive && !cell.willLiveNextStep) {
            cell.kill();
        }
    }

    /**
     * Sets property 'willLiveNextStep' of each cell accordingly to life conditions
     *
     * @method
     */
    function _calculateNextStep(cell) {
        var aliveNeighbors = _calculateAliveNeighborsOf.call(this, cell),
            willDie = aliveNeighbors < this.conditions.minNeighborsToLive || aliveNeighbors > this.conditions.maxNeighborsToLive,
            willBeBorn = aliveNeighbors === this.conditions.neighborsToBeBorn;
        if (cell.isAlive) {
            cell.willLiveNextStep = !willDie;
        } else {
            cell.willLiveNextStep = willBeBorn;
        }
    }

    /**
     * @method calculateAliveNeighborsOf
     * @param cell {Object} Cell around witch alive neighbors will be found
     * @return {Number} count of alive neighbors
     */
    function _calculateAliveNeighborsOf(cell) {
        return cell.neighborsCoordinates
            .map(mapCells.bind(this))
            .filter(filterCells)
            .length;
    }

    function mapCells(coordinates) {
        return this.universe.space[coordinates.x][coordinates.y];
    }

    function filterCells(cell) {
        return cell.isAlive;
    }

    /**
     * Sets step counter value
     *
     * @method setStepCounter
     * @private
     * @param value {Number} Sets given value to DOM element
     */
    function _setStepCounter(value) {
        this.step = value;
        this.ui.stepDisplaySpot.innerHTML = value;
    }

    /**
     * Renders game field
     *
     * @method render
     * @private
     * @parem {Cell} cell
     */
    function _render(cell) {
        var x = cell.x * (config.CELL_WIDTH + config.BORDER_WIDTH) + config.BORDER_WIDTH,
            y = cell.y * (config.CELL_HEIGHT + config.BORDER_WIDTH) + config.BORDER_WIDTH;
        cell.calculateColor();
        this.ui.canvasContext.fillStyle = cell.color;
        this.ui.canvasContext.fillRect(x, y, config.CELL_WIDTH, config.CELL_HEIGHT);
    }

    return Game;
});
