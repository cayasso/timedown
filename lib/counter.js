'use strict';

/**
 * Module dependencies.
 */

import Emitter from 'eventemitter3';
import ms from 'ms';

const RATE = 10;
const ENDING = 5000;

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
    this._duration = 0;
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
  
  init(time, { refresh, ending }) {
    this.duration(time);
    this.ending(ending);
    this.refresh(refresh);
    this.status = Counter.CREATED;
    return this;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} rate
   * @return {Counter} this
   * @api public
   */

  refresh(rate = RATE) {
    if (!arguments.length) return this._refresh;
    this._refresh = this.tms(rate, RATE);
    return this;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} time
   * @return {Counter} this
   * @api public
   */

  ending(time = ENDING) {
    if (!arguments.length) return this._ending;
    this._ending = this.tms(time, ENDING);
    return this;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} time
   * @return {Counter} this
   * @api public
   */

  duration(time) {
    if (!arguments.length) return this.ms;
    this.ms = this._duration = this.tms(time, 0);
    return this;
  }

  /**
   * Start (resume) timer.
   *
   * @return {Counter} this
   * @api public
   */

  start(rate) {
    if (!this.ms || Counter.STARTED === this.status 
      || Counter.ENDED === this.status) return this;
    if (rate) this.rate(rate);
    this.status = Counter.STARTED;
    this.emits('start', { ms: this.ms });
    setImmediate(this.tick.bind(this));
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @return {Counter} this
   * @api public
   */

  stop() {
    if (Counter.CREATED === this.status
      || Counter.STOPPED === this.status
      || Counter.ENDED === this.status) return this;
    this.status = Counter.STOPPED;
    this.emits('stop', { ms: this.ms });
    this.timer.tock.clear(this.ns);
    return this;
  }

  /**
   * Restart (reset and restart) timer.
   *
   * @return {Counter} this
   * @api public
   */

  restart(time, options) {
    this.reset(time, options, true);
    this.start();
    return this;
  }

  /**
   * Reset timer.
   *
   * @param {Number|String} time
   * @param {Object} [options]
   * @param {Boolean} [silent]
   * @return {Counter} this
   * @api public
   */

  reset(time, options, silent = false) {
    time = time || this._duration;
    options = options || this.options;
    if (this.timer.tock.active(this.ns)) {
      this.timer.tock.clear(this.ns);
    }
    this.init(time, options);
    if (!silent) this.emits('reset', { ms: this.ms });
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
    this.reset(null, null, true);
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
    delete this.rate;
    this.status = Counter.DESTROYED;
    this.emits('delete');
    this.removeAllListeners();
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
   * Set timer to start or to stop.
   *
   * @param {String} action
   * @return {Counter} this
   * @api private
   */

  tick() {
    let ctx = this;
    let time = ctx.ms;
    let ending = false;
    let start = Date.now();
    (function next() {
      if (Counter.ENDED === ctx.status) return;
      if (Counter.CREATED === ctx.status) return;
      if (Counter.STOPPED === ctx.status) return;
      ctx.ms = time - ((Date.now() - start) | 0);
      let e = { ms: ctx.ms };
      if (ctx.ms <= 0) return ctx.end();
      if (!ending && ctx.ms < ctx._ending) {
        ending = true;
        ctx.emits('ending', e);
      }
      ctx.emits('tick', e);
      ctx.timer.tock.setTimeout(ctx.ns, next, ctx._rate);
    }());
    return this;
  }

  /**
   * Transform time to ms or return default value.
   *
   * @param {Mixed} time
   * @param {Number} def
   * @return {Counter} this
   * @api private
   */

  tms(time, def) {
    if (!isNaN(time)) return time;
    time = ms(time);
    return !isNaN(time) ? time : def;
  }
}

Counter.ENDED = 'ENDED';
Counter.CREATED = 'CREATED';
Counter.STARTED = 'STARTED';
Counter.STOPPED = 'STOPPED';
Counter.DESTROYED = 'DESTROYED';
