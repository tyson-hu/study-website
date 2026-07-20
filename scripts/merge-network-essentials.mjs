import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const essentialsPath = path.join(root, "src/data/network-essentials.json");
const questionsPath = path.join(root, "src/data/questions.json");

function normalizeTextMode(n) {
  if (n === 1 || n === 2) return "ipv6";
  if (n === 4 || n === 7 || n === 9) return "hex";
  return "exact";
}

function toTextInput(q) {
  const acceptedAnswers = q.options.filter((o) => o.isCorrect).map((o) => o.text);
  return {
    ...q,
    type: "text_input",
    options: [],
    correctOptionIds: [],
    acceptedAnswers,
    textMatchMode: normalizeTextMode(q.number),
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const essentialsRaw = JSON.parse(fs.readFileSync(essentialsPath, "utf8"));
const questionsRaw = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

assert(Array.isArray(essentialsRaw), "essentials must be array before merge");
assert(Array.isArray(questionsRaw.questions), "questions.json missing questions");

const ne = essentialsRaw.map((q, i) => {
  const withId = { ...q, id: `ne-${q.id}`, number: i + 1 };
  return q.number <= 9 ? toTextInput(withId) : withId;
});

const orig = questionsRaw.questions.map((q, i) => ({
  ...q,
  id: `orig-${q.id}`,
  number: ne.length + i + 1,
}));

const questions = [...ne, ...orig];
const ids = new Set(questions.map((q) => q.id));
assert(ids.size === questions.length, "duplicate question ids");
assert(
  questions.every((q, i) => q.number === i + 1),
  "numbers must be continuous from 1"
);
assert(
  ne.slice(0, 9).every((q) => q.type === "text_input"),
  "first 9 original essentials must be text_input"
);

const out = {
  title: "Networking Essentials",
  source: "Network Essentials Practice Exam + Question Set",
  totalQuestions: questions.length,
  schemaVersion: "1.1",
  questions,
};

assert(out.totalQuestions === questions.length, "totalQuestions mismatch");
assert(out.totalQuestions === 205, `expected 205 questions, got ${out.totalQuestions}`);

fs.writeFileSync(essentialsPath, JSON.stringify(out, null, 2) + "\n");
fs.unlinkSync(questionsPath);
console.log(`Merged ${out.totalQuestions} questions into network-essentials.json; deleted questions.json`);
