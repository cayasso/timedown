'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('eventemitter3');
var ms = require('ms');

/**
 * Counter object inheriting emitter methods.
 * 
 * @type {Object}
 */

var Counter = Object.create(Emitter.prototype);

/**
 * Counter statuses.
 *
 * @type {String}
 */

Counter.ENDED = 'ENDED';
Counter.STOPPED = 'STOPPED';
Counter.CREATED = 'CREATED';
Counter.ENDING = 'ENDING';
Counter.STARTED = 'STARTED';

/**
 * Create a timer object.
 *
 * @param {Timer} timer
 * @param {String} name
 * @param {Number|String} time
 * @param {Object} [options]
 * @return {Counter} this
 * @api public
 */

Counter.create = function create(timer, name, time, options) {
  return Object.create(this).init(timer, name, time, options);
};

/**
 * Initialize object.
 *
 * @param {Timer} timer
 * @param {String} name
 * @param {Number|String} time
 * @param {Object} [options]
 * @return {Counter} this
 * @api public
 */

Counter.init = function init(timer, name, time, options) {
  options = options || {};
  this.timer = timer;
  this.stop();
  this.ms = 0;
  this.ns = String(name);
  var refresh = 'refresh' in options ? options.refresh : '10ms';
  var ending = 'ending' in options ? options.ending : '10s';
  this.duration = 'number' === typeof time ? time : ms(time);
  this.ending = 'number' === typeof ending ? ending : ms(ending);
  this.refresh = 'number' === typeof refresh ? refresh : ms(refresh);
  this.status = Counter.CREATED;
  return this;
};

/**
 * Set time duration.
 *
 * @param {Number|String} time
 * @return {Counter} this
 * @api public
 */

Counter.refresh = function refresh(time) {
  this.duration = 'number' === typeof time ? time : ms(time);
  return this;
};

/**
 * Set time duration.
 *
 * @param {Number|String} time
 * @return {Counter} this
 * @api public
 */

Counter.time = function time(time) {
  this.duration = 'number' === typeof time ? time : ms(time);
  return this;
};

/**
 * Start (resume) timer.
 *
 * @return {Counter} this
 * @api public
 */

Counter.start = function start() {
  if (/started|ended/.test(this.status)) return this;
  this.set('start');
  return this;
};

/**
 * Stop (pause) timer.
 *
 * @return {Counter} this
 * @api public
 */

Counter.stop = function stop() {
  if (/stopped|ended/.test(this.status)) return this;
  this.set('stop');
  return this;
};

/**
 * Reset timer.
 *
 * @param {Number|String} time
 * @param {Object} [options]
 * @return {Counter} this
 * @api private
 */

Counter.reset = function reset(time, options) {
  return this.init(this.timer, this.ns, time || this.duration, options);
};

/**
 * Set timer to start or to stop.
 *
 * @param {String} action
 * @return {Counter} this
 * @api private
 */

Counter.set = function set(action) {

  var ctx = this;
  var ns = ctx.ns;
  var start = Date.now();
  var status = ctx.status;
  var duration = ctx.duration;
  var isEndingEmitted = false; 

  if ('stop' === action) {
    ctx.status = Counter.STOPPED;
    ctx.emit('stop', { ms: ctx.ms });
    ctx.timer.emit('stop', ctx, { ms: ctx.ms });
    return ctx;
  }

  if ('start' === action) {
    ctx.status = Counter.STARTED;
    ctx.emit('start', { ms: ctx.ms });
    ctx.timer.emit('start', ctx, { ms: ctx.ms });
  }

  (function interval() {

    if (Counter.STOPPED === ctx.status) return;

    if (Counter.STOPPED === status) {
      status = ctx.status;
      duration = ctx.duration - ctx.ms;
    }

    ctx.ms = duration - ((Date.now() - start) | 0);

    if (ctx.ms > 0) {
      ctx.emit('tick', { ms: ctx.ms });
      ctx.timer.emit('tick', ctx, { ms: ctx.ms });
      ctx.timer.tock.setTimeout(ns, interval, ctx.refresh);
      if (!isEndingEmitted && ctx.ms < ctx.ending) {
        isEndingEmitted = true;
        ctx.emit('ending');
        ctx.timer.emit('ending', ctx);
      }
    } else {
      ctx.ms = 0;
      ctx.timer.tock.clear(ns);
      ctx.status = Counter.ENDED;
      ctx.emit('end');
      ctx.timer.emit('end', ctx);
    }

  }.call(ctx));

  return ctx;

};

/**
 * Method to extend the object.
 * 
 * @param {Function} fn
 * @param {Object} [options]
 * @api public
 */

Counter.use = function use(fn, options) {
  fn(this, options);
  return this;
};

/**
 * Expose Counter object.
 *
 * @type {Object}
 */

module.exports = Counter;
