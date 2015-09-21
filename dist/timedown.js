(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _ms = require('ms');

var _ms2 = _interopRequireDefault(_ms);

/**
 * Counter statuses.
 *
 * @type {String}
 */

var Counter = (function (_Emitter) {
  _inherits(Counter, _Emitter);

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

  function Counter(timer, name, time) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, Counter);

    _get(Object.getPrototypeOf(Counter.prototype), 'constructor', this).call(this);
    this.timer = timer;
    this.stop();
    this.ms = 0;
    this.ns = String(name);
    var refresh = 'refresh' in options ? options.refresh : '10ms';
    var ending = 'ending' in options ? options.ending : '10s';
    this.duration = 'number' === typeof time ? time : (0, _ms2['default'])(time);
    this.ending = 'number' === typeof ending ? ending : (0, _ms2['default'])(ending);
    this.refresh = 'number' === typeof refresh ? refresh : (0, _ms2['default'])(refresh);
    this.status = Counter.CREATED;
  }

  /**
   * Set time duration.
   *
   * @param {Number|String} time
   * @return {Counter} this
   * @api public
   */

  _createClass(Counter, [{
    key: 'refresh',
    value: function refresh(time) {
      this.duration = 'number' === typeof time ? time : (0, _ms2['default'])(time);
      return this;
    }

    /**
     * Set time duration.
     *
     * @param {Number|String} time
     * @return {Counter} this
     * @api public
     */

  }, {
    key: 'time',
    value: function time(_time) {
      this.duration = 'number' === typeof _time ? _time : (0, _ms2['default'])(_time);
      return this;
    }

    /**
     * Start (resume) timer.
     *
     * @return {Counter} this
     * @api public
     */

  }, {
    key: 'start',
    value: function start() {
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

  }, {
    key: 'stop',
    value: function stop() {
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

  }, {
    key: 'reset',
    value: function reset(time, options) {
      return this.constructor(this.timer, this.ns, time || this.duration, options);
    }

    /**
     * Set timer to start or to stop.
     *
     * @param {String} action
     * @return {Counter} this
     * @api private
     */

  }, {
    key: 'set',
    value: function set(action) {

      var e = null;
      var ctx = this;
      var ns = ctx.ns;
      var start = Date.now();
      var status = ctx.status;
      var duration = ctx.duration;
      var isEndingEmitted = false;

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

        ctx.ms = duration - (Date.now() - start | 0);

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
      })();

      return ctx;
    }
  }]);

  return Counter;
})(_eventemitter32['default']);

exports['default'] = Counter;

Counter.CREATED = 'CREATED';
Counter.STARTED = 'STARTED';
Counter.STOPPED = 'STOPPED';
Counter.ENDED = 'ENDED';
module.exports = exports['default'];

},{"eventemitter3":3,"ms":4}],2:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = Factory;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _counter = require('./counter');

var _counter2 = _interopRequireDefault(_counter);

var _tickTock = require('tick-tock');

var _tickTock2 = _interopRequireDefault(_tickTock);

var Timer = (function (_Emitter) {
  _inherits(Timer, _Emitter);

  /**
   * Initialize object.
   *
   * @return {Timer} this
   * @api public
   */

  function Timer() {
    _classCallCheck(this, Timer);

    _get(Object.getPrototypeOf(Timer.prototype), 'constructor', this).call(this);
    this.tock = new _tickTock2['default'](this);
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

  _createClass(Timer, [{
    key: 'ns',
    value: function ns(id, time, options) {
      var counter = this.counters.get(id);
      if (!counter) {
        counter = new _counter2['default'](this, id, time, options);
        this.counters.set(id, counter);
      } else {
        counter = counter.reset(time, options);
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

  }, {
    key: 'start',
    value: function start(id) {
      var counter = this.counters.get(id);
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

  }, {
    key: 'stop',
    value: function stop(id) {
      var counter = this.counters.get(id);
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

  }, {
    key: 'reset',
    value: function reset(id, time, options) {
      var counter = this.counters.get(id);
      if (counter) counter.reset(time, options);
      return this;
    }

    /**
     * Method to extend the object.
     * 
     * @param {Function} fn
     * @param {Object} [options]
     * @api public
     */

  }, {
    key: 'use',
    value: function use(fn, options) {
      fn(this, options);
      return this;
    }
  }]);

  return Timer;
})(_eventemitter32['default']);

function Factory() {
  return new Timer();
}

Factory.Timer = Timer;
Factory.Counter = _counter2['default'];
module.exports = exports['default'];

},{"./counter":1,"eventemitter3":3,"tick-tock":5}],3:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],5:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , ms = require('millisecond');

/**
 * Timer instance.
 *
 * @constructor
 * @param {Object} timer New timer instance.
 * @param {Function} clear Clears the timer instance.
 * @param {Function} duration Duration of the timer.
 * @param {Function} fn The functions that need to be executed.
 * @api private
 */
function Timer(timer, clear, duration, fn) {
  this.start = +(new Date());
  this.duration = duration;
  this.clear = clear;
  this.timer = timer;
  this.fns = [fn];
}

/**
 * Calculate the time left for a given timer.
 *
 * @returns {Number} Time in milliseconds.
 * @api public
 */
Timer.prototype.remaining = function remaining() {
  return this.duration - this.taken();
};

/**
 * Calculate the amount of time it has taken since we've set the timer.
 *
 * @returns {Number}
 * @api public
 */
Timer.prototype.taken = function taken() {
  return +(new Date()) - this.start;
};

/**
 * Custom wrappers for the various of clear{whatever} functions. We cannot
 * invoke them directly as this will cause thrown errors in Google Chrome with
 * an Illegal Invocation Error
 *
 * @see #2
 * @type {Function}
 * @api private
 */
function unsetTimeout(id) { clearTimeout(id); }
function unsetInterval(id) { clearInterval(id); }
function unsetImmediate(id) { clearImmediate(id); }

/**
 * Simple timer management.
 *
 * @constructor
 * @param {Mixed} context Context of the callbacks that we execute.
 * @api public
 */
function Tick(context) {
  if (!(this instanceof Tick)) return new Tick(context);

  this.timers = {};
  this.context = context || this;
}

/**
 * Return a function which will just iterate over all assigned callbacks and
 * optionally clear the timers from memory if needed.
 *
 * @param {String} name Name of the timer we need to execute.
 * @param {Boolean} clear Also clear from memory.
 * @returns {Function}
 * @api private
 */
Tick.prototype.tock = function ticktock(name, clear) {
  var tock = this;

  return function tickedtock() {
    if (!(name in tock.timers)) return;

    var timer = tock.timers[name]
      , fns = timer.fns.slice()
      , l = fns.length
      , i = 0;

    if (clear) tock.clear(name);
    else tock.start = +new Date();

    for (; i < l; i++) {
      fns[i].call(tock.context);
    }
  };
};

/**
 * Add a new timeout.
 *
 * @param {String} name Name of the timer.
 * @param {Function} fn Completion callback.
 * @param {Mixed} time Duration of the timer.
 * @returns {Tick}
 * @api public
 */
Tick.prototype.setTimeout = function timeout(name, fn, time) {
  var tick = this
    , tock;

  if (tick.timers[name]) {
    tick.timers[name].fns.push(fn);
    return tick;
  }

  tock = ms(time);
  tick.timers[name] = new Timer(
    setTimeout(tick.tock(name, true), ms(time)),
    unsetTimeout,
    tock,
    fn
  );

  return tick;
};

/**
 * Add a new interval.
 *
 * @param {String} name Name of the timer.
 * @param {Function} fn Completion callback.
 * @param {Mixed} time Interval of the timer.
 * @returns {Tick}
 * @api public
 */
Tick.prototype.setInterval = function interval(name, fn, time) {
  var tick = this
    , tock;

  if (tick.timers[name]) {
    tick.timers[name].fns.push(fn);
    return tick;
  }

  tock = ms(time);
  tick.timers[name] = new Timer(
    setInterval(tick.tock(name), ms(time)),
    unsetInterval,
    tock,
    fn
  );

  return tick;
};

/**
 * Add a new setImmediate.
 *
 * @param {String} name Name of the timer.
 * @param {Function} fn Completion callback.
 * @returns {Tick}
 * @api public
 */
Tick.prototype.setImmediate = function immediate(name, fn) {
  var tick = this;

  if ('function' !== typeof setImmediate) return tick.setTimeout(name, fn, 0);

  if (tick.timers[name]) {
    tick.timers[name].fns.push(fn);
    return tick;
  }

  tick.timers[name] = new Timer(
    setImmediate(tick.tock(name, true)),
    unsetImmediate,
    0,
    fn
  );

  return tick;
};

/**
 * Check if we have a timer set.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api public
 */
Tick.prototype.active = function active(name) {
  return name in this.timers;
};

/**
 * Properly clean up all timeout references. If no arguments are supplied we
 * will attempt to clear every single timer that is present.
 *
 * @param {Arguments} ..args.. The names of the timeouts we need to clear
 * @returns {Tick}
 * @api public
 */
Tick.prototype.clear = function clear() {
  var args = arguments.length ? arguments : []
    , tick = this
    , timer, i, l;

  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  }

  if (!args.length) {
    for (timer in tick.timers) {
      if (has.call(tick.timers, timer)) args.push(timer);
    }
  }

  for (i = 0, l = args.length; i < l; i++) {
    timer = tick.timers[args[i]];

    if (!timer) continue;
    timer.clear(timer.timer);

    timer.fns = timer.timer = timer.clear = null;
    delete tick.timers[args[i]];
  }

  return tick;
};

/**
 * Adjust a timeout or interval to a new duration.
 *
 * @returns {Tick}
 * @api public
 */
Tick.prototype.adjust = function adjust(name, time) {
  var interval
    , tick = this
    , tock = ms(time)
    , timer = tick.timers[name];

  if (!timer) return tick;

  interval = timer.clear === unsetInterval;
  timer.clear(timer.timer);
  timer.start = +(new Date());
  timer.duration = tock;
  timer.timer = (interval ? setInterval : setTimeout)(tick.tock(name, !interval), tock);

  return tick;
};

/**
 * We will no longer use this module, prepare your self for global cleanups.
 *
 * @returns {Boolean}
 * @api public
 */
Tick.prototype.end = Tick.prototype.destroy = function end() {
  if (!this.context) return false;

  this.clear();
  this.context = this.timers = null;

  return true;
};

//
// Expose the timer factory.
//
Tick.Timer = Timer;
module.exports = Tick;

},{"millisecond":6}],6:[function(require,module,exports){
'use strict';

var regex = new RegExp('^((?:\\d+)?\\.?\\d+) *('+ [
  'milliseconds?',
  'msecs?',
  'ms',
  'seconds?',
  'secs?',
  's',
  'minutes?',
  'mins?',
  'm',
  'hours?',
  'hrs?',
  'h',
  'days?',
  'd',
  'weeks?',
  'wks?',
  'w',
  'years?',
  'yrs?',
  'y'
].join('|') +')?$', 'i');

var second = 1000
  , minute = second * 60
  , hour = minute * 60
  , day = hour * 24
  , week = day * 7
  , year = day * 365;

/**
 * Parse a time string and return the number value of it.
 *
 * @param {String} ms Time string.
 * @returns {Number}
 * @api private
 */
module.exports = function millisecond(ms) {
  if ('string' !== typeof ms || '0' === ms || +ms) return +ms;

  var match = regex.exec(ms)
    , amount;

  if (!match) return 0;

  amount = parseFloat(match[1]);

  switch (match[2].toLowerCase()) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return amount * year;

    case 'weeks':
    case 'week':
    case 'wks':
    case 'wk':
    case 'w':
      return amount * week;

    case 'days':
    case 'day':
    case 'd':
      return amount * day;

    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return amount * hour;

    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return amount * minute;

    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return amount * second;

    default:
      return amount;
  }
};

},{}]},{},[2]);
