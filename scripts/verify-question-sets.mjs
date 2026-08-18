import assert from "node:assert/strict";

// The current datasets were consolidated in repository history. The original
// upstream exports were not preserved as tracked files, so this script verifies
// the normalized JSON that ships with the application.

// After implementation, this imports compiled logic via duplicating checks against JSON:
import essentials from "../src/data/network-essentials.json" with { type: "json" };
import fundamentals from "../src/data/network-fundamentals.json" with { type: "json" };

assert.equal(essentials.title, "Networking Essentials");
assert.equal(essentials.totalQuestions, essentials.questions.length);
assert.equal(fundamentals.title, "Network Fundamentals");
assert.equal(fundamentals.totalQuestions, fundamentals.questions.length);
assert.ok(essentials.questions.length > 0);
assert.ok(fundamentals.questions.length > 0);

for (const questionSet of [essentials, fundamentals]) {
  const ids = questionSet.questions.map((question) => question.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    `${questionSet.title} contains duplicate question IDs`
  );

  for (const question of questionSet.questions) {
    if (
      question.type !== "single_choice" &&
      question.type !== "multiple_choice"
    ) {
      continue;
    }

    const keyedIds = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
      .sort();
    const declaredIds = [...question.correctOptionIds].sort();
    assert.deepEqual(
      declaredIds,
      keyedIds,
      `${questionSet.title} ${question.id} has inconsistent correct answers`
    );
  }
}

console.log("question set JSON ok", essentials.totalQuestions, fundamentals.totalQuestions);
