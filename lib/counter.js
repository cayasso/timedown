'use strict';

/**
 * Module dependencies.
 */

import Emitter from 'eventemitter3';
import ms from 'ms';

/**
 * Counter statuses.
 *
 * @type {String}
 */

export default class Counter extends Emitter {

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

  constructor(timer, name, time, options = {}) {
    super();
    this.timer = timer;
    this.stop();
    this.ms = 0;
    this.ns = String(name);
    let refresh = 'refresh' in options ? options.refresh : '10ms';
    let ending = 'ending' in options ? options.ending : '10s';
    this.duration = 'number' === typeof time ? time : ms(time);
    this.ending = 'number' === typeof ending ? ending : ms(ending);
    this.refresh = 'number' === typeof refresh ? refresh : ms(refresh);
    this.status = Counter.CREATED;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} time
   * @return {Counter} this
   * @api public
   */

  refresh(time) {
    this.duration = 'number' === typeof time ? time : ms(time);
    return this;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} time
   * @return {Counter} this
   * @api public
   */

  time(time) {
    this.duration = 'number' === typeof time ? time : ms(time);
    return this;
  }

  /**
   * Start (resume) timer.
   *
   * @return {Counter} this
   * @api public
   */

  start() {
    if (/START|ENDED/.test(this.status)) return this;
    this.set('start');
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @return {Counter} this
   * @api public
   */

  stop() {
    if (/STOPPED|ENDED/.test(this.status)) return this;
    this.set('stop');
    return this;
  }

  /**
   * Reset timer.
   *
   * @param {Number|String} time
   * @param {Object} [options]
   * @return {Counter} this
   * @api private
   */

  reset(time, options) {
    return this.constructor(this.timer, this.ns, time || this.duration, options);
  }

  /**
   * Set timer to start or to stop.
   *
   * @param {String} action
   * @return {Counter} this
   * @api private
   */

  set(action) {

    let e = null;
    let ctx = this;
    let ns = ctx.ns;
    let start = Date.now();
    let status = ctx.status;
    let duration = ctx.duration;
    let isEndingEmitted = false; 

    if ('stop' === action) {
      e = { ms: ctx.ms };
      ctx.status = Counter.STOPPED;
      ctx.emit('stop', e);
      ctx.timer.emit('stop', ctx, e);
      return ctx;
    }

    if ('start' === action) {
      e = { ms: ctx.ms || duration };
      ctx.status = Counter.STARTED;
      ctx.emit('start', e);
      ctx.timer.emit('start', ctx, e);
    }

    (function interval() {

      if (Counter.STOPPED === ctx.status) return;

      if (Counter.STOPPED === status) {
        status = ctx.status;
        duration = ctx.duration - ctx.ms;
      }

      ctx.ms = duration - ((Date.now() - start) | 0);

      if (ctx.ms > 0) {
        e = { ms: ctx.ms };
        ctx.emit('tick', e);
        ctx.timer.emit('tick', ctx, e);
        ctx.timer.tock.setTimeout(ns, interval, ctx.refresh);
        if (!isEndingEmitted && ctx.ms < ctx.ending) {
          isEndingEmitted = true;
          ctx.emit('ending', e);
          ctx.timer.emit('ending', ctx, e);
        }
      } else {
        ctx.ms = 0;
        ctx.timer.tock.clear(ns);
        ctx.status = Counter.ENDED;
        ctx.emit('end');
        ctx.timer.emit('end', ctx);
      }

    }());

    return ctx;
  }
}

Counter.CREATED = 'CREATED';
Counter.STARTED = 'STARTED';
Counter.STOPPED = 'STOPPED';
Counter.ENDED = 'ENDED';
