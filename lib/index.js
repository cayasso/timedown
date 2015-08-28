'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('eventemitter3');
var Counter = require('./counter');
var Tick = require('tick-tock');

/**
 * Timer object inheriting emitter methods.
 * 
 * @type {Object}
 */

var Timer = Object.create(Emitter.prototype);

/**
 * Create a timer object.
 *
 * @return {Timer} this
 * @api public
 */

Timer.create = function create() {
  return Object.create(this).init();
};

/**
 * Initialize object.
 *
 * @return {Timer} this
 * @api public
 */

Timer.init = function init() {
  this.tock = new Tick(this);
  this.counters = {};
  return this;
};

/**
 * Get counter object.
 *
 * @param {String} name
 * @param {Number|String} time
 * @param {Object} options
 * @return {Counter} this
 * @api public
 */

Timer.ns = function ns(name, time, options) {
  var counter = this.counters[name];
  return !counter 
    ? Counter.create(this, name, time, options)
    : counter.reset(time, options);
};

/**
 * Start (resume) timer.
 *
 * @param {String} name
 * @return {Timer} this
 * @api public
 */

Timer.start = function start(name) {
  var counter = this.counters[name];
  if (counter) counter.start();
  return this;
};

/**
 * Stop (pause) timer.
 *
 * @param {String} name
 * @return {Timer} this
 * @api public
 */

Timer.stop = function stop(name) {
  var counter = this.counters[name];
  if (counter) counter.stop();
  return this;
};

/**
 * Reset timer.
 *
 * @param {String} name
 * @param {Number|String} time
 * @param {Object} options
 * @return {Timer} this
 * @api private
 */

Timer.reset = function reset(name, time, options) {
  var counter = this.counters[name];
  if (counter) counter.reset(time, options);
  return this;
};

/**
 * Method to extend the object.
 * 
 * @param {Function} fn
 * @param {Object} [options]
 * @api public
 */

Timer.use = function use(fn, options) {
  fn(this, options);
  return this;
};

/**
 * Export create method.
 *
 * @return {Timer}
 * @api public
 */

module.exports = function factory() {
  return Timer.create();
};

/**
 * Expose Timer object.
 *
 * @type {Object}
 */

module.exports.Timer = Timer;
module.exports.Counter = Counter;
