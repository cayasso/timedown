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

  ns(id, time, options) {
    let counter = this.counters.get(id);
    if (!counter) {
      counter = new Counter(this, id, time, options);
      this.counters.set(id, counter);
    }
    return counter;
  }

  /**
   * Start (resume) timer.
   *
   * @param {String} name
   * @return {Timer} this
   * @api public
   */

  start(id) {
    let counter = this.counters.get(id);
    if (counter) counter.start();
    return this;
  }

  /**
   * Stop (pause) timer.
   *
   * @param {String} name
   * @return {Timer} this
   * @api public
   */

  stop(id) {
    let counter = this.counters.get(id);
    if (counter) counter.stop();
    return this;
  }

  /**
   * Reset timer.
   *
   * @param {String} name
   * @param {Number|String} time
   * @param {Object} [options]
   * @return {Timer} this
   * @api private
   */

  reset(id, time, options) {
    let counter = this.counters.get(id);
    if (counter) counter.reset(time, options);
    return this;
  }

  /**
   * Destroy timer.
   *
   * @param {String} id
   * @return {Timer} this
   * @api private
   */

  delete(id) {
    let counter = this.counters.get(id);
    if (!counter) return this;
    this.counters.delete(id);
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
