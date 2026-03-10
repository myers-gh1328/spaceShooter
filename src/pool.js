// ============================================================
// NOVA DRIFT — Generic Object Pool
// ============================================================

/**
 * Creates a reusable object pool.
 *
 * @template T
 * @param {() => T} factory         — creates a brand-new blank instance
 * @param {(obj: T, ...args: any[]) => void} resetFn — re-initialises for reuse
 * @param {number} initialSize      — number of objects to pre-allocate
 * @returns {{
 *   acquire(...args: any[]): T,
 *   release(obj: T): void,
 *   readonly size: number,
 *   readonly available: number,
 * }}
 */
export function createPool(factory, resetFn, initialSize) {
  const free = [];

  // Pre-allocate
  for (let i = 0; i < initialSize; i++) {
    free.push(factory());
  }

  function acquire(...args) {
    const obj = free.length > 0 ? free.pop() : factory();
    resetFn(obj, ...args);
    return obj;
  }

  function release(obj) {
    free.push(obj);
  }

  return {
    acquire,
    release,
    get size() { return free.length; },
    get available() { return free.length; },
  };
}
