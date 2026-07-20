import assert from "node:assert/strict";

// Essentials merge landed in commit da9ca4a; raw inputs are recoverable via:
//   git show da9ca4a^:src/data/questions.json
//   git show da9ca4a^:src/data/network-essentials.json

// After implementation, this imports compiled logic via duplicating checks against JSON:
import essentials from "../src/data/network-essentials.json" with { type: "json" };
import fundamentals from "../src/data/network-fundamentals.json" with { type: "json" };

assert.equal(essentials.title, "Networking Essentials");
assert.equal(essentials.totalQuestions, essentials.questions.length);
assert.equal(fundamentals.title, "Network Fundamentals");
assert.equal(fundamentals.totalQuestions, fundamentals.questions.length);
assert.ok(essentials.questions.length > 0);
assert.ok(fundamentals.questions.length > 0);
console.log("question set JSON ok", essentials.totalQuestions, fundamentals.totalQuestions);
