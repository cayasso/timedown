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
   * Class constructor.
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
    this.ns = String(name);
    this.options = options;
    this.init(time, options);
  }

  /**
   * Initialize object.
   *
   * @param {Number|String} time
   * @param {Object} [options]
   * @return {Counter} this
   * @api public
   */
  
  init(time, options = {}) {
    let refresh = 'refresh' in options ? options.refresh : '10ms';
    let ending = 'ending' in options ? options.ending : '10s';
    this.ms = this.duration = 'number' === typeof time ? time : ms(time);
    this.ending = 'number' === typeof ending ? ending : ms(ending);
    this.refresh = 'number' === typeof refresh ? refresh : ms(refresh);
    this.status = Counter.CREATED;
    return this;
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
    if (Counter.STARTED === this.status 
      || Counter.ENDED === this.status) return this;
    this.status = Counter.STARTED;
    let e = { ms: this.ms || this.duration };
    this.tick();
    this.emits('start', e);
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @return {Counter} this
   * @api public
   */

  stop() {
    if (Counter.STOPPED === this.status 
      || Counter.ENDED === this.status) return this;
    this.status = Counter.STOPPED;
    let e = { ms: this.ms };
    this.emits('stop', e);
    this.timer.tock.clear(this.ns);
    return this;
  }

  /**
   * End timer.
   *
   * @return {Counter} this
   * @api private
   */

  end() {
    if (Counter.ENDED === this.status) return this;
    this.ms = 0;
    this.status = Counter.ENDED;
    this.timer.tock.clear(this.ns);
    this.emits('end');
    return this;
  }
  
  /**
   * Emits events on timer and counter.
   *
   * @param {String} name
   * @param {Object} data
   * @return {Counter} this
   * @api public
   */
  
  emits(name, data) {
    this.emit(name, data);
    this.timer.emit(name, this, data);
  }

  /**
   * Reset timer.
   *
   * @param {Number|String} time
   * @param {Object} [options]
   * @return {Counter} this
   * @api public
   */

  reset(time, options) {
    time = time || this.duration;
    options = options || this.options;
    this.end();
    this.init(time, options);
    return this;
  }

  /**
   * Destroy timer.
   *
   * @return {Counter} this
   * @api public
   */

  delete() {
    delete this.ns;
    delete this.duration;
    delete this.ending;
    delete this.refresh;
    this.status = Counter.DESTROYED;
    this.emits('delete');
    this.removeAllListeners();
    return this;
  }

  /**
   * Set timer to start or to stop.
   *
   * @param {String} action
   * @return {Counter} this
   * @api private
   */

  tick() {
    let ctx = this;
    let ms = ctx.ms;
    let ending = false;
    let start = Date.now();
    (function next() {
      if (Counter.ENDED === ctx.status) return;
      if (Counter.CREATED === ctx.status) return;
      if (Counter.STOPPED === ctx.status) return;
      ctx.ms = ms - ((Date.now() - start) | 0);
      let e = { ms: ctx.ms };
      if (ctx.ms <= 0) return ctx.reset();
      if (!ending && ctx.ms < ctx.ending) {
        ending = true;
        ctx.emits('ending', e);
      }
      ctx.emits('tick', e);
      ctx.timer.tock.setTimeout(ctx.ns, next, ctx.refresh);
    }());
    return this;
  }
}

Counter.ENDED = 'ENDED';
Counter.CREATED = 'CREATED';
Counter.STARTED = 'STARTED';
Counter.STOPPED = 'STOPPED';
Counter.DESTROYED = 'DESTROYED';
