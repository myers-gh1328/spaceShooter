import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

export { assert };

export function approxEqual(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} to be within ${epsilon} of ${expected}`);
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function createMockLocalStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

export function withMockedRandom(sequence, fn) {
  const original = Math.random;
  let index = 0;
  Math.random = () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return value;
  };
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

export function withGlobal(name, value, fn) {
  const hadValue = Object.prototype.hasOwnProperty.call(globalThis, name);
  const previous = globalThis[name];
  globalThis[name] = value;
  try {
    return fn();
  } finally {
    if (hadValue) {
      globalThis[name] = previous;
    } else {
      delete globalThis[name];
    }
  }
}
