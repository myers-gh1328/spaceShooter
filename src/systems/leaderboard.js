// ============================================================
// NOVA DRIFT — Leaderboard (localStorage top-10)
// ============================================================

const STORAGE_KEY   = 'novadrift_leaderboard';
const MAX_ENTRIES   = 10;

/**
 * @typedef {{ score: number, level: number, date: string }} LBEntry
 */

export function createLeaderboard() {
  /** @type {LBEntry[]} */
  let _entries = _load();

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_entries));
    } catch { /* quota exceeded — silently skip */ }
  }

  /** Returns the best score ever recorded, 0 if none. */
  function getHighScore() {
    if (_entries.length === 0) return 0;
    return _entries[0].score;
  }

  /**
   * Adds a score entry.
   * @returns {boolean} true when this is a new overall high score
   */
  function addScore(score, level) {
    const wasHighScore = score > getHighScore();
    /** @type {LBEntry} */
    const entry = { score, level, date: new Date().toLocaleDateString() };
    _entries.push(entry);
    _entries.sort((a, b) => b.score - a.score);
    if (_entries.length > MAX_ENTRIES) _entries.length = MAX_ENTRIES;
    _save();
    return wasHighScore;
  }

  /** Returns a copy of the stored entries (already sorted descending). */
  function getEntries() {
    return _entries.slice();
  }

  return { getHighScore, addScore, getEntries };
}
