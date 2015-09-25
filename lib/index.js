'use strict';

// es6 runtime requirements
// In node.js env, polyfill might be already loaded (from any npm package),
// that's why we do this check.
if (!global._babelPolyfill) {
  require('babel/polyfill')
}

/**
 * Module dependencies.
 */

import Emitter from 'eventemitter3';
import Counter from './counter';
import Tick from 'tick-tock';

class Timer extends Emitter {

  /**
   * Initialize object.
   *
   * @return {Timer} this
   * @api public
   */

  constructor() {
    super();
    this.tock = new Tick(this);
    this.counters = new Map();
    return this;
  }

  /**
   * Get counter object.
   *
   * @param {String} name
   * @param {Number|String} time
   * @param {Object} [options]
   * @return {Counter} this
   * @api public
   */

  ns(name, time, options) {
    let counter = this.counters.get(name);
    if (1 === arguments.length) return counter;
    if (!counter) {
      counter = new Counter(this, name, time, options);
      this.counters.set(name, counter);
    } else {
      counter.reset(time, options, true);
    }
    return counter;
  }

  /**
   * Start (resume) timer.
   *
   * @param {String} name
   * @param {String|Number} rate
   * @return {Timer} this
   * @api public
   */

  start(name, rate) {
    let counter = this.counters.get(name);
    if (counter) counter.start(rate);
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @param {String} name
   * @return {Timer} this
   * @api public
   */

  stop(name) {
    let counter = this.counters.get(name);
    if (counter) counter.stop();
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @param {String|Number} time
   * @param {Object} [options]
   * @return {Timer} this
   * @api public
   */

  restart(time, options) {
    let counter = this.counters.get(name);
    if (counter) counter.restart(time, options);
    return this;
  }

  /**
   * Reset timer.
   *
   * @param {String} name
   * @param {Number|String} time
   * @param {Object} [options]
   * @param {Object} silent
   * @return {Timer} this
   * @api public
   */

  reset(name, time, options, silent) {
    let counter = this.counters.get(name);
    if (counter) counter.reset(time, options, silent);
    return this;
  }

  /**
   * Destroy timer.
   *
   * @param {String} name
   * @return {Timer} this
   * @api public
   */

  delete(name) {
    let counter = this.counters.get(name);
    if (!counter) return this;
    this.counters.delete(name);
    counter.delete();
    return this;
  }

  /**
   * Destroy timer.
   *
   * @return {Timer} this
   * @api private
   */

  destroy() {
    this.tock.end();
    this.counters.clear();
    this.removeListener();
    return this;
  }

  /**
   * Method to extend the object.
   * 
   * @param {Function} fn
   * @param {Object} [options]
   * @api public
   */

  use(fn, options) {
    fn(this, options);
    return this;
  }

}

export default function Factory() {
  return new Timer();
}

Factory.Timer = Timer;
Factory.Counter = Counter;
