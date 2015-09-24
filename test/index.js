'use strict';

import TimeDown from '../lib/index';
import should from 'should';

const timer = new TimeDown();
let ids = 0;

Object.defineProperty(TimeDown, 'id', {
  get: function read() {
    return 'abc' + (ids++);
  }
});

describe('TimeDown', () => {

  it('should be valid function', () => {
    TimeDown.should.be.a.Function;
  });

  it('should have namespaces', () => {
    TimeDown.Timer.should.be.a.Function;
    TimeDown.Counter.should.be.a.Function;
  });

  it('should have required methods', () => {
    let countdown = timer.ns(TimeDown.id, '30s');
    countdown.start.should.be.a.Function;
    countdown.stop.should.be.an.Object;
    countdown.reset.should.be.a.Function;
    countdown.duration.should.be.a.Function;
    countdown.ending.should.be.a.Function;
    countdown.refresh.should.be.a.Function;
  });

  it('should create a valid countdown instance', () => {
    let ns = TimeDown.id;
    let countdown = timer.ns(ns, '10s');
    countdown.duration().should.be.eql(10000);
    countdown.ns.should.be.eql(ns);
    countdown.status.should.be.eql('CREATED');
  });

  it('should create a valid countdown with options', () => {
    let countdown = timer.ns(TimeDown.id, '10s', { ending: '20ms', refresh: '10ms' });
    countdown.ending().should.be.eql(20);
    countdown.refresh().should.be.eql(10);
  });

  it('should destroy countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '10s');
    countdown.on('start', function(){});
    countdown.on('tick', function(){});
    countdown.on('stop', function(){});
    countdown.on('end', function(){});
    countdown.start();
    countdown.on('delete', done);
    countdown.delete();
    (countdown.duration() === undefined).should.be.ok;
    (countdown.ending() === undefined).should.be.ok;
    (countdown.refresh() === undefined).should.be.ok;
    countdown.listeners().should.be.empty();
    countdown.status.should.be.eql('DESTROYED');
  });

  it('should be able to change the countdown duration during reset', () => {
    let countdown = timer.ns(TimeDown.id, '10s');
    countdown.duration().should.be.eql(10000);
    countdown.reset('30s');
    countdown.duration().should.be.eql(30000);
  });

  it('should emit tick event', (done) => {
    let countdown = timer.ns(TimeDown.id, '10s');
    countdown.start();
    countdown.once('tick', (time) => {
      countdown.ms.should.be.equal(time.ms);
      countdown.stop();
      done();
    });
  });

  it('should not start if counter is already started', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('start', function() {
      countdown.start();
    });
    countdown.on('end', done);
    countdown.start();
    countdown.start();
  });

  it('should not start if counter is already ended', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('end', function() {
      countdown.start();
      countdown.start();
      done();
    });
    countdown.start();
  });

  it('should not stop if counter is already stopped', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('stop', function() {
      countdown.stop();
      countdown.stop();
      done();
    });
    countdown.start();
    countdown.stop();
  });

  it('should not stop if counter is already ended', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('end', function() {
      countdown.stop();
      countdown.stop();
      done();
    });
    countdown.on('stop', done);
    countdown.start();
  });

  it('should restart after stop', (done) => {
    
    let startTime, stopTime;
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('start', function(time) {
      startTime = time.ms;
    });

    countdown.on('stop', function(time) {
      stopTime = time.ms;
      countdown.ms.should.be.eql(stopTime);
    });

    countdown.on('end', function() {
      stopTime.should.be.eql(startTime);
      (Date.now() - started).should.be.belowOrEqual(165);
      done();
    });
    
    countdown.start();

    let started = Date.now();

    setTimeout(function() {
      countdown.stop();
      setTimeout(function() {
        countdown.start();
      }, 50);
    }, 50);

  });

  it('should emit started event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('start', (time) => {
      done();
    });
    countdown.start();
  });

  it('should emit ending event', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { refresh: '5ms', ending: '20ms' });
    countdown.start();
    countdown.on('ending', (time) => {
      countdown.stop();
      done();
    });
  });

  it('should emit ended event', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms');
    countdown.start();
    countdown.on('end', () => {
      countdown.stop();
      done();
    });
  });

  it('should emit stopped event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('stop', () => {
      done();
    });
    countdown.stop();

  });

  it('should allow stopping countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('tick', () => {
      countdown.stop();
      done();
    });
  });

  it('should allow stopping and starting a countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms', { ending: 0 });
    countdown.start();
    setTimeout(() => {
      countdown.stop();
      countdown.status.should.be.eql('STOPPED');
      setTimeout(() => {
        countdown.start();
        countdown.status.should.be.eql('STARTED');
        countdown.on('end', (time) => {
          countdown.stop();
          done();
        });
      }, 10);
    }, 10);
  });

  it('should allow resetting countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms');
    countdown.on('tick', () => {
      countdown.reset();
      countdown.status.should.be.eql('CREATED');
      countdown.ms.should.be.eql(100);
      done();
    });
    countdown.start();
  });

  it('should allow restarting countdown', (done) => {
    let count = 0;
    let countdown = timer.ns(TimeDown.id, '100ms');
    countdown.on('end', function(){
      count.should.be.eql(2);
      done();
    });
    countdown.on('start', function() {
      ++count;
    });
    countdown.start();
    countdown.restart();
  });

  it('should allow resetting and starting countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '100ms');
    countdown.on('end', done);
    countdown.start();
    countdown.reset();
    countdown.start();
    countdown.reset();
    countdown.start();
  });

  it('should not start a countdown without duration', () => {
    let countdown = timer.ns(TimeDown.id, undefined);
    countdown.on('start', function() {
      throw Error('Should not start');
    });
    countdown.start();
  });

});

