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
  });

  it('should create a valid countdown instance', () => {
    let ns = TimeDown.id;
    let countdown = timer.ns(ns, '10s');
    countdown.duration.should.be.eql(10000);
    countdown.ns.should.be.eql(ns);
    countdown.status.should.be.eql('CREATED');
  });

  it('should create a valid countdown with options', () => {
    let countdown = timer.ns(TimeDown.id, '10s', { ending: '20ms', refresh: '10ms' });
    countdown.ending.should.be.eql(20);
    countdown.refresh.should.be.eql(10);
  });

  it('should destroy countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '10s');
    countdown.on('started', function(){});
    countdown.on('tick', function(){});
    countdown.on('stopped', function(){});
    countdown.on('ended', function(){});
    countdown.start();
    countdown.on('deleted', done);
    countdown.delete();
    (countdown.timer === undefined).should.be.ok;
    (countdown.ending === undefined).should.be.ok;
    (countdown.refresh === undefined).should.be.ok;
    countdown.listeners().should.be.empty();
    countdown.status.should.be.eql('DESTROYED');
  });

  it('should be able to change the countdown duration during reset', () => {
    let countdown = timer.ns(TimeDown.id, '10s');
    countdown.duration.should.be.eql(10000);
    countdown.reset('30s');
    countdown.duration.should.be.eql(30000);
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

  it('should not start a started affect started counter when sending multiple starts', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms', { refresh: '5ms', ending: '20ms' });
    countdown.start();
    let startTime = Date.now();
    countdown.on('ending', function() {
      countdown.start();
    });
    countdown.on('ended', (time) => {
      let endTime = Date.now();
      (endTime - startTime).should.be.belowOrEqual(510);
      done();
    });
  });

  it('should emit started event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms', { refresh: '5ms', ending: '20ms' });
    countdown.on('started', (time) => {
      done();
    });
    countdown.start();
  });

  it('should emit ending event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms', { refresh: '5ms', ending: '20ms' });
    countdown.start();
    countdown.on('ending', (time) => {
      countdown.stop();
      done();
    });
  });

  it('should emit ended event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('ended', () => {
      countdown.stop();
      done();
    });
  });

  it('should emit stopped event', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('stopped', () => {
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
    let countdown = timer.ns(TimeDown.id, '500ms', { ending: 0 });
    countdown.start();
    setTimeout(() => {
      countdown.stop();
      countdown.status.should.be.eql('STOPPED');
      setTimeout(() => {
        countdown.start();
        countdown.status.should.be.eql('STARTED');
        countdown.on('ended', (time) => {
          countdown.stop();
          done();
        });
      }, 10);
    }, 10);
  });

  it('should allow resetting countdown', (done) => {
    let countdown = timer.ns(TimeDown.id, '500ms');
    countdown.start();
    countdown.on('tick', () => {
      countdown.reset();
      countdown.status.should.be.eql('CREATED');
      countdown.ms.should.be.eql(0);
      done();
    });
  });

});

