import type {
  AnswerState,
  MatchAnswerMap,
  Question,
  QuestionResult,
  TextFieldAnswerMap,
  TextFieldConfig,
  TextMatchMode,
} from "@/types/question";

export function isTextInput(question: Question): boolean {
  return question.type === "text_input";
}

export function isMatchQuestion(question: Question): boolean {
  return question.type === "match";
}

export function isMultipleChoice(question: Question): boolean {
  return question.type === "multiple_choice";
}

export function getTextFields(question: Question): TextFieldConfig[] {
  if (question.textFields?.length) {
    return question.textFields;
  }

  if (question.acceptedAnswers?.length) {
    return [
      {
        id: "answer",
        label: "Your answer",
        acceptedAnswers: question.acceptedAnswers,
        matchMode: question.textMatchMode ?? "exact",
      },
    ];
  }

  return [];
}

export function normalizeTextAnswer(
  value: string,
  mode: TextMatchMode = "exact"
): string {
  const trimmed = value.trim();

  switch (mode) {
    case "case_insensitive":
      return trimmed.toLowerCase();
    case "hex": {
      const withoutPrefix = trimmed.replace(/^0x/i, "");
      return withoutPrefix.toLowerCase();
    }
    case "ipv6":
      return trimmed.toLowerCase().replace(/\s+/g, "");
    default:
      return trimmed;
  }
}

function isFieldValueCorrect(
  userValue: string,
  acceptedAnswers: string[],
  mode: TextMatchMode = "case_insensitive"
): boolean {
  const normalizedUser = normalizeTextAnswer(userValue, mode);
  return acceptedAnswers.some(
    (answer) => normalizeTextAnswer(answer, mode) === normalizedUser
  );
}

export function evaluateTextFieldAnswers(
  question: Question,
  textFieldAnswers: TextFieldAnswerMap
): AnswerState {
  const fields = getTextFields(question);
  if (fields.length === 0) return "incorrect";

  const values = fields.map((field) => textFieldAnswers[field.id]?.trim() ?? "");
  if (values.every((value) => !value)) return "unanswered";
  if (values.some((value) => !value)) return "unanswered";

  const correctCount = fields.filter((field, index) =>
    isFieldValueCorrect(
      values[index],
      field.acceptedAnswers,
      field.matchMode ?? "case_insensitive"
    )
  ).length;

  if (correctCount === fields.length) return "correct";
  if (correctCount > 0) return "partial";
  return "incorrect";
}

export function getTextFieldResults(
  question: Question,
  textFieldAnswers: TextFieldAnswerMap
): Record<string, boolean> {
  const fields = getTextFields(question);

  return Object.fromEntries(
    fields.map((field) => {
      const value = textFieldAnswers[field.id] ?? "";
      return [
        field.id,
        isFieldValueCorrect(
          value,
          field.acceptedAnswers,
          field.matchMode ?? "case_insensitive"
        ),
      ];
    })
  );
}

export function evaluateMatchAnswer(
  question: Question,
  matchAnswer: MatchAnswerMap
): AnswerState {
  const pairs = question.matchPairs ?? [];
  if (pairs.length === 0) return "incorrect";

  const answered = pairs.filter((pair) => matchAnswer[pair.id]);
  if (answered.length === 0) return "unanswered";
  if (answered.length < pairs.length) return "unanswered";

  const correctCount = pairs.filter(
    (pair) => matchAnswer[pair.id] === pair.id
  ).length;

  if (correctCount === pairs.length) return "correct";
  if (correctCount > 0) return "partial";
  return "incorrect";
}

export function evaluateAnswer(
  question: Question,
  selectedIds: string[],
  textFieldAnswers?: TextFieldAnswerMap,
  matchAnswer?: MatchAnswerMap
): AnswerState {
  if (isTextInput(question)) {
    return evaluateTextFieldAnswers(question, textFieldAnswers ?? {});
  }

  if (isMatchQuestion(question)) {
    return evaluateMatchAnswer(question, matchAnswer ?? {});
  }

  const correct = new Set(question.correctOptionIds);
  const selected = new Set(selectedIds);

  if (selected.size === 0) return "unanswered";

  const allCorrectSelected = [...correct].every((id) => selected.has(id));
  const noIncorrectSelected = [...selected].every((id) => correct.has(id));

  if (allCorrectSelected && noIncorrectSelected) return "correct";
  if (allCorrectSelected && !noIncorrectSelected) return "partial";
  return "incorrect";
}

export function scoreResults(results: QuestionResult[]): {
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  percent: number;
} {
  let correct = 0;
  let partial = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const result of results) {
    switch (result.state) {
      case "correct":
        correct++;
        break;
      case "partial":
        partial++;
        break;
      case "incorrect":
        incorrect++;
        break;
      default:
        unanswered++;
    }
  }

  const total = results.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { correct, partial, incorrect, unanswered, percent };
}

export function isQuestionAnswered(
  question: Question,
  selectedIds: string[],
  textFieldAnswers?: TextFieldAnswerMap,
  matchAnswer?: MatchAnswerMap
): boolean {
  if (isTextInput(question)) {
    const fields = getTextFields(question);
    if (fields.length === 0) return false;
    return fields.every((field) => Boolean(textFieldAnswers?.[field.id]?.trim()));
  }

  if (isMatchQuestion(question)) {
    const pairs = question.matchPairs ?? [];
    const answers = matchAnswer ?? {};
    return pairs.length > 0 && pairs.every((pair) => Boolean(answers[pair.id]));
  }

  return selectedIds.length > 0;
}

export function getTextInputPlaceholder(field: TextFieldConfig): string {
  if (field.placeholder) return field.placeholder;

  switch (field.matchMode) {
    case "ipv6":
      return "e.g. FE80::ACAD:40";
    case "hex":
      return "e.g. 0x4E6";
    default:
      return `Enter ${field.label.toLowerCase()}`;
  }
}

/** Number of questions drawn for a timed test session. */
export const TEST_QUESTION_COUNT = 50;

/** Test session length: 2 hours. */
export const TEST_DURATION_MS = 2 * 60 * 60 * 1000;

/** Fisher–Yates sample of up to `count` items (does not mutate input). */
export function sampleQuestions<T>(items: T[], count: number): T[] {
  const n = Math.min(Math.max(count, 0), items.length);
  if (n === 0) return [];
  if (n === items.length) return [...items];

  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy.slice(0, n);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
