/**
 * Ensures getQuizProgressSnapshot is referentially stable across calls.
 * useSyncExternalStore infinite-loops (React #185) if it is not.
 *
 * Run: npx tsx scripts/verify-quiz-persistence-snapshot.mjs
 */
import assert from "node:assert/strict";

const store = new Map();

globalThis.window = {
  localStorage: {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  },
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return true;
  },
};

const {
  getQuizProgressSnapshot,
  saveQuizProgress,
} = await import("../src/lib/quiz-persistence.ts");

const identity = {
  setId: "network-fundamentals",
  mode: "practice",
  schemaVersion: "1",
  totalQuestions: 10,
};

const a = getQuizProgressSnapshot(identity);
const b = getQuizProgressSnapshot(identity);
assert.equal(a, b, "empty snapshot must be referentially stable");

saveQuizProgress({
  ...a,
  currentIndex: 3,
  updatedAt: Date.now(),
});

const c = getQuizProgressSnapshot(identity);
const d = getQuizProgressSnapshot(identity);
assert.equal(c, d, "saved snapshot must be referentially stable");
assert.equal(c.currentIndex, 3);

console.log("ok: quiz progress snapshots are referentially stable");
