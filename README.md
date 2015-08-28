# TimeDown

[![Build Status](https://img.shields.io/travis/cayasso/timedown/master.svg)](https://travis-ci.org/cayasso/timedown)
[![NPM version](https://img.shields.io/npm/v/timedown.svg)](https://www.npmjs.com/package/timedown)
[![Coverage Status](https://img.shields.io/coveralls/cayasso/timedown/master.svg)](https://coveralls.io/r/cayasso/timedown)

A multi countdown timer for node with namespace.

## Installation

```
npm install timedown
```

## Usage

```js
var TimeDown = require('timedown');
var timer = TimeDown();

// foo and bar are coundown objects.
var foo = timer.ns('foo', '10s');
var bar = timer.ns('bar', '10s');

// foo counter methods
foo.start();
foo.stop();
foo.reset();

// bar counter methods
bar.start();
bar.stop();
bar.reset();

// Listen to bar counter events
bar.on('tick', function(time) {
  console.log(time.ms);
});

bar.on('ending', function(time) {
  console.log('ENDING', time.ms);
});

bar.on('end', function() {
  console.log('ENDED');
});

// Handle counters from timer main object
timer.start('foo');
timer.stop('foo');
timer.reset('foo', '20s');

// Handle counter events from timer main object
timer.on('tick', function(counter, time) {
  console.log(counter.ns, time.ms);
});

timer.on('ending', function(counter, time) {
  console.log('ENDING %s with time %d', counter.ns, time.ms);
});

timer.on('end', function(counter) {
  console.log('ENDED %s', counter.ns);
});
```

## Run tests

``` bash
$ make test
```

## License

(The MIT License)

Copyright (c) 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
