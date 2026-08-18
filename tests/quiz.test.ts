import assert from "node:assert/strict"
import test from "node:test"

import {
  evaluateAnswer,
  sampleQuestions,
  scoreResults,
} from "../src/lib/quiz"
import {
  createEmptyQuizProgress,
  isValidQuizProgress,
} from "../src/lib/quiz-persistence"
import type { Question, QuestionResult } from "../src/types/question"

const multipleChoiceQuestion: Question = {
  id: "test-question",
  number: 1,
  type: "multiple_choice",
  question: "Choose the two correct options.",
  options: [
    { id: "A", text: "A", isCorrect: true },
    { id: "B", text: "B", isCorrect: true },
    { id: "C", text: "C", isCorrect: false },
  ],
  correctOptionIds: ["A", "B"],
}

test("sampleQuestions selects 50 unique items without mutating the bank", () => {
  const bank = Array.from({ length: 100 }, (_, index) => index)
  const original = [...bank]
  const sample = sampleQuestions(bank, 50)

  assert.equal(sample.length, 50)
  assert.equal(new Set(sample).size, 50)
  assert.ok(sample.every((item) => bank.includes(item)))
  assert.deepEqual(bank, original)
})

test("evaluateAnswer distinguishes unanswered, correct, and partial answers", () => {
  assert.equal(evaluateAnswer(multipleChoiceQuestion, []), "unanswered")
  assert.equal(evaluateAnswer(multipleChoiceQuestion, ["A", "B"]), "correct")
  assert.equal(
    evaluateAnswer(multipleChoiceQuestion, ["A", "B", "C"]),
    "partial"
  )
})

test("scoreResults counts each result state and scores correct answers only", () => {
  const results: QuestionResult[] = [
    { questionId: "1", selectedIds: ["A"], state: "correct" },
    { questionId: "2", selectedIds: ["A"], state: "partial" },
    { questionId: "3", selectedIds: ["A"], state: "incorrect" },
    { questionId: "4", selectedIds: [], state: "unanswered" },
  ]

  assert.deepEqual(scoreResults(results), {
    correct: 1,
    partial: 1,
    incorrect: 1,
    unanswered: 1,
    percent: 25,
  })
})

test("quiz persistence accepts only state matching the active question set", () => {
  const identity = {
    setId: "essentials" as const,
    mode: "test" as const,
    schemaVersion: "1.1",
    totalQuestions: 205,
  }
  const state = createEmptyQuizProgress(identity)

  assert.equal(isValidQuizProgress(state, identity), true)
  assert.equal(
    isValidQuizProgress(state, { ...identity, schemaVersion: "2.0" }),
    false
  )
})
