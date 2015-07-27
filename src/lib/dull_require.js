/*
 * DullRequireJS. Simple weak version (yet)
 * Copyright (C) Artem Devlysh, 2015
 *
 * Advantages:
 * + Simple
 *
 * Lacks:
 * - Uses deprecated features
 * - Weak
 */

/**
 * @module require
 */
(function (w) {
  var callbackArguments;

  /**
   * @return {HTMLScriptElement} script which funciton 'require' was called from
   */
  var detectCurrentScript = function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
  };

  /**
   * @param {String} url to required script file
   * @return {String} text of required script
   */
  var requestScript = function (url) {
    var scriptText, scriptRequest;
    scriptRequest = new XMLHttpRequest();
    scriptRequest.open('GET', url, false);
    scriptRequest.onreadystatechange = function () {
      if (scriptRequest.readyState === 4) {
        if (scriptRequest.status === 200 || scriptRequest.status === 0) {
          scriptText = scriptRequest.responseText;
        }
      }
    };
    scriptRequest.send(null);
    return scriptText;
  };

  /**
   * @param {String} requiredScript url to required script file
   * @param {String} currentScript url to script file from which requiredScript was required
   * @param {String} requiredScriptText text of required script
   * @return {String} script text with header
   */
  var addHeaderToScript = function (requiredScript, currentScript, requiredScriptText) {
    return '/** \n file: ' + requiredScript + ' \n required by: ' + currentScript + ' \n */ \n\n' + requiredScriptText;
  };

  /**
   * @param {String} url of file
   * @return {String} url of directory containing given file
   */
  var determineDirectory = function (url) {
    return url.substring(0, url.lastIndexOf('/'));
  };

  /**
   * @param {String} url
   * @return {String} trimmed url
   */
  var trimUrl = function (url) {
    url = url.substr(url.length - 3) === '.js' ? url : url + '.js';
    url = url.substr(0,2) === './' ? url.substr(2) : url;
    return url;
  };

  /**
   * @param {Function} callback
   * @return value returned by callback function
   */
  var define = function (callback) {
    var args = callbackArguments;
    callbackArguments = null;
    return callback.apply({}, args);
  };

  /**
   * @namespace window
   * @method require
   * @param {String} path to required script file
   * @return required module
   */
  w.require = function (path) {
    var scriptText,
        currentScript = detectCurrentScript(),
        currentScriptDir = determineDirectory(currentScript.src),
        src = currentScriptDir + '/' + trimUrl(path);
    // Getting arguments resdy for 'define' function
    callbackArguments = Array.prototype.splice.call(arguments, 1);
    // Making request to get script text
    scriptText = requestScript(src);
    // Putting request information in head of file
    addHeaderToScript(scriptText);
    // Returning evaluated script text
    return eval(scriptText);
  };

  /**
   * @namespace window
   * @method define
   */
  w.define = function(){};
})(window);