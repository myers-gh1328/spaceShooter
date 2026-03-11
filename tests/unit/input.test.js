import test from 'node:test';
import { createInput } from '../../src/input.js';
import { assert, withGlobal } from '../harness.js';

test('input tracks held and pressed keys', () => {
  const listeners = new Map();
  const fakeWindow = {
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type) { listeners.delete(type); },
  };

  withGlobal('window', fakeWindow, () => {
    const input = createInput();
    input.init();

    listeners.get('keydown')({ key: 'ArrowUp', preventDefault() {} });
    assert.equal(input.isDown('ArrowUp'), true);
    assert.equal(input.wasPressed('ArrowUp'), true);

    input.update();
    assert.equal(input.wasPressed('ArrowUp'), false);

    listeners.get('keyup')({ key: 'ArrowUp' });
    assert.equal(input.isDown('ArrowUp'), false);

    input.destroy();
  });
});
