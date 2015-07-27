/*
 * DullRequireJS. Simple version
 * Copyright (C) Artem Devlysh, 2015
 *
 * Advantages:
 * + Simple
 *
 * Lacks:
 * - Uses deprecated features (yet)
 * - Weak (yet)
 */

(function (w) {

  'use strict';

  /**
   * Array of arguments prepared for callback function from 'define' method
   *
   * @property
   * @type Array
   * @private
   */
  var callbackArguments = [];
  /**
   * Array of arguments prepared for callback function from 'define' method
   *
   * @property
   * @type Array
   * @private
   */
  var scriptElementsStack = [];
  /**
   * @function
   * @return {HTMLScriptElement}
   */
  function detectCurrentScript () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
  }

  /**
   * @function
   * @return {HTMLScriptElement}
   */
  function detectPreviousScript () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-2];
  }

  /**
   * Creates script element
   *
   * @function
   * @param src {String} URL for new script element
   * @return {Number} ID of required script in 'scriptElementsStack'
   */
  function createScriptElement (src) {
    var newScript = document.createElement('script');
    newScript.src = src;
    scriptElementsStack.push(newScript);
    document.body.appendChild(newScript);
    return scriptElementsStack.length-1;
  }

  /**
   * Creates script element
   *
   * @function
   * @param iD {String} ID of element, thich should be removed
   */
  function removeScriptElement (iD) {
    document.body.removeChild(scriptElementsStack[iD]);
  }

  /**
   * Creates HTTP Request for script text
   *
   * @function
   * @param url {String} URL to required JS file
   * @return {String} Text of required file
   */
  function requestScript (url) {
    var text, request;
    request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200 || request.status === 0) {
          text = request.responseText;
        }
      }
    };
    request.send(null);
    return text;
  }

  /**
   * Adds header with description of required file
   *
   * @function
   * @param requiredScript {String} URL to required script file
   * @param requiredScriptText {String} Text of required script
   * @return {String} Script with header
   */
  function addHeaderToScript (requiredScriptURL, scriptText) {
    return '/** \n file: ' + requiredScriptURL + ' \n required by ' + detectPreviousScript().src + ' \n */ \n\n' + scriptText;
  }

  /**
   * Determines in which directory file is contained
   *
   * @function
   * @param url {String} URL of JS file
   * @return {String} URL of directory containing given file
   */
  function determineDirectory (url) {
    return url.substring(0, url.lastIndexOf('/'));
  }

  /**
   * Trims url, removes prefixes and endings
   *
   * @function
   * @param url {String} Url which shoulr be trimmed
   * @return {String} Trimmed url without "./" prefix and ".js" ending
   */
  function trimUrl (url) {
    url = url.substr(url.length - 3) === '.js' ? url : url + '.js';
    url = url.substr(0,2) === './' ? url.substr(2) : url;
    return url;
  }

  /**
   * Function which should be stated in requided file
   * Defines required module
   * Method 'define' is always evaluated from string before is returned value of method 'require'
   *
   * @function
   * @param callback {Function} Function which will be called in as returning value of 'define'
   * @return value returned by callback function
   */
  function define (callback) {
    var args = callbackArguments;
    callbackArguments = null;
    return callback.apply({}, args);
  }

  /**
   * Method 'require' fetches and evaluates string from JS file with given relative path
   *
   * @method require
   * @param path {String} Relative path to required script file
   * @return required module
   */
  w.require = function (path) {
    var result, scriptText, scriptElementID,
        currentScript = detectCurrentScript(),
        currentScriptDir = determineDirectory(currentScript.src),
        src = currentScriptDir + '/' + trimUrl(path);
    // Adding script element to stack and appending it
    scriptElementID = createScriptElement(src);
    // Making request to get script text
    scriptText = requestScript(src);
    // Getting agruments ready for 'define`s' callback
    callbackArguments = Array.prototype.splice.call(arguments, 1);
    // Putting request information in head of file
    scriptText = addHeaderToScript(src, scriptText);
    // evaluating script text
    result = eval(scriptText);
    // Romoving script element from DOM
    removeScriptElement(scriptElementID);
    return result;
  };

  /**
   * Stub method in case of script file appending to DOM
   *
   * @method define
   */
  w.define = function(){};
})(window);