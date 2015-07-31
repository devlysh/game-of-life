/*
 * G fremawork to manage application
 * Copyright (C) Artem Devlysh, 2015
 */

window.G = (function (w) {

  /**
   * @class G
   * @constructor
   */
  var G = function () {
    this.apps = {};
  };

  G.prototype = {
    /**
     * @method app
     * @param {String} name
     * @return {App}
     */
    app: function (name) {
      if (this.apps.hasOwnProperty(name)) {
        return this.apps[name];
      } else {
        throw new Error('Unable to found app "' + name + '"');
      }
    },

    /**
     * @method createApp
     * @param {String} name
     * @return {App}
     */
    createApp: function (name) {
      var app;
      if (!this.apps.hasOwnProperty(name)) {
        app = new App(name);
        this.apps[name] = app;
        return app;
      } else {
        throw new Error('App "' + name + '" already exists');
      }
    },

    /**
     * @method createApp
     * @param {String} name
     * @return {App}
     */
    destroyApp: function (name) {
      if (this.apps.hasOwnProperty(name)) {
        delete this.apps[name];
      } else {
        throw new Error('Unable to find app "' + name + '"');
      }
    }
  };

  /**
   * @class App
   * @constructor
   */
  var App = function (name) {
    /**
     * @property sandbox
     * @type Sandbox
     */
    this.sandbox = new Sandbox();

    /**
     * @property name
     * @type String
     */
    this.name = name;

    /**
     * @property config
     * @type Object
     */
    this.config = {};

    /**
     * @property modules
     * @type Object
     */
    this.modules = {};
  };

  App.prototype = {
    /**
     * @method createModule
     * @param {String} name
     * @param {Function} constructor
     * @return {Module}
     */
    createModule: function (name, constructor) {
      var module = new constructor();
      this.modules[name] = module;
      return module;
    },

    /**
     * @method module
     * @param {String} name
     * @return {Module}
     */
    module: function (name) {
      if (this.modules.hasOwnProperty(name)) {
        return this.modules[name];
      } else {
        throw new Error('Unable to find module "' + name + '"');
      }
    },

    /**
     * @method configure
     * @param {Object} config
     */
    configure: function (config) {
      this.config = config;
    },
  };

  /**
   * @class Sandbox
   * @constructor
   */
  var Sandbox = function () {};

  Sandbox.prototype = {
    /**
     * @method add
     */
    add: function (name, value) {
      var result;
      if (typeof value === 'function') {
        result = value();
      } else {
        result = value;
      }
      if (!this.hasOwnProperty(name)) {
        this[name] = result;
        return this[name];
      } else {
        throw new Error('Sandbox element "' + name + '" already exists');
      }
    },

    /**
     * @method remove
     */
    remove: function (name) {
      if (this.hasOwnProperty(name)) {
        delete this[name];
      } else {
        throw new Error('Unable to find element "' + name + '"');
      }
    },

    /**
     * @method get
     */
    get: function (name) {
      if (this.hasOwnProperty(name)) {
        return this[name];
      } else {
        throw new Error('Unable to find element "' + name + '"');
      }
    },

    /**
     * @method set
     */
    set: function (name, value) {
      var result;
      if (typeof value === 'function') {
        result = value();
      } else {
        result = value;
      }
      if (this.hasOwnProperty(name)) {
        this[name] = result;
      } else {
        throw new Error('Unable to find element "' + name + '"');
      }
    }
  };

  return new G();
})(window);