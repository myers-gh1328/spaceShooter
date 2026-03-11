import test from 'node:test';
import { createLoop } from '../../src/loop.js';
import { assert, withGlobal } from '../harness.js';

test('loop performs fixed-step updates and renders', () => {
  let scheduled;
  let updateCount = 0;
  let renderCount = 0;

  withGlobal('requestAnimationFrame', (cb) => { scheduled = cb; return 1; }, () => {
    withGlobal('cancelAnimationFrame', () => {}, () => {
      const loop = createLoop({
        update() { updateCount += 1; },
        render() { renderCount += 1; },
      });

      loop.start();
      scheduled(1);
      scheduled(21);

      assert.equal(updateCount, 1);
      assert.equal(renderCount, 2);
    });
  });
});

test('loop pause halts updates until resume', () => {
  let scheduled;
  let updateCount = 0;

  withGlobal('requestAnimationFrame', (cb) => { scheduled = cb; return 1; }, () => {
    withGlobal('cancelAnimationFrame', () => {}, () => {
      const loop = createLoop({
        update() { updateCount += 1; },
        render() {},
      });

      loop.start();
      scheduled(0);
      loop.pause();
      scheduled(1000);
      assert.equal(updateCount, 0);

      loop.resume();
      scheduled(1000);
      scheduled(1018);
      assert.equal(updateCount, 1);
    });
  });
});
