var TimeDown = require('../');
var timer = TimeDown();
var should = require('should');
var ids = 0;

Object.defineProperty(TimeDown, 'id', {
  get: function read() {
    return 'abc' + (ids++);
  }
});

describe('TimeDown', function() {

  it('should be valid function', function () {
    TimeDown.should.be.a.Function;
  });

  it('should have namespaces', function () {
    TimeDown.Timer.should.be.a.Function;
    TimeDown.Counter.should.be.a.Function;
  });

  it('should have required methods', function () {
    var countdown = timer.ns(TimeDown.id, '30s');
    countdown.start.should.be.a.Function;
    countdown.stop.should.be.an.Object;
    countdown.reset.should.be.a.Function;
    countdown.create.should.be.a.Function;
  });

  it('should create a valid countdown instance', function() {
    var ns = TimeDown.id;
    var countdown = timer.ns(ns, '10s');
    countdown.duration.should.be.eql(10000);
    countdown.ns.should.be.eql(ns);
    countdown.status.should.be.eql('CREATED');
  });

  it('should create a valid countdown with options', function() {
    var countdown = timer.ns(TimeDown.id, '10s', { ending: '20ms', refresh: '10ms' });
    countdown.ending.should.be.eql(20);
    countdown.refresh.should.be.eql(10);
  });

  it('should be able to change the countdown duration during reset', function() {
    var countdown = timer.ns(TimeDown.id, '10s');
    countdown.duration.should.be.eql(10000);
    countdown.reset('30s');
    countdown.duration.should.be.eql(30000);
  });

  it('should emit tick event', function(done) {
    var countdown = timer.ns(TimeDown.id, '10s');
    countdown.start();
    countdown.once('tick', function (time) {
      countdown.ms.should.be.equal(time.ms);
      countdown.stop();
      done();
    });
  });

  it('should emit ending event', function(done) {
    var countdown = timer.ns(TimeDown.id, '500ms', { refresh: '5ms', ending: '20ms' });
    countdown.start();
    countdown.on('ending', function (time) {
      countdown.stop();
      done();
    });
  });

  it('should emit end event', function(done) {
    var countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('end', function () {
      countdown.stop();
      done();
    });
  });

  it('should allow stopping countdown', function(done) {
    var countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('tick', function () {
      countdown.stop();
      done();
    });
  });

  it('should allow stopping and starting a countdown', function(done) {
    var countdown = timer.ns(TimeDown.id, '500ms', { ending: 0 });
    countdown.start();
    setTimeout(function () {
      countdown.stop();
      countdown.status.should.be.eql('STOPPED');
      setTimeout(function () {
        countdown.start();
        countdown.status.should.be.eql('STARTED');
        countdown.on('end', function (time) {
          countdown.stop();
          done();
        });
      }, 10);
    }, 10);
  });

  it('should allow resetting countdown', function(done) {
    var countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('tick', function () {
      countdown.reset();
      countdown.status.should.be.eql('CREATED');
      countdown.ms.should.be.eql(0);
      done();
    });
  });

});

