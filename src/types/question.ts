export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "text_input"
  | "match";

export type TextMatchMode = "exact" | "case_insensitive" | "hex" | "ipv6";

export type QuizMode = "practice" | "test";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TextFieldConfig {
  id: string;
  label: string;
  acceptedAnswers: string[];
  placeholder?: string;
  matchMode?: TextMatchMode;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface QuestionMedia {
  type: "image";
  url: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  matchPairs?: MatchPair[];
  textFields?: TextFieldConfig[];
  acceptedAnswers?: string[];
  textMatchMode?: TextMatchMode;
  media?: QuestionMedia[];
  /** Optional markdown teaching note shown after answer feedback is revealed. */
  explanation?: string;
}

export interface QuestionSet {
  title: string;
  source: string;
  totalQuestions: number;
  schemaVersion: string;
  questions: Question[];
}

export type AnswerState = "unanswered" | "correct" | "incorrect" | "partial";

export type TextFieldAnswerMap = Record<string, string>;

export interface QuestionResult {
  questionId: string;
  selectedIds: string[];
  textFieldAnswers?: TextFieldAnswerMap;
  matchAnswer?: Record<string, string>;
  state: AnswerState;
}

export type MatchAnswerMap = Record<string, string>;
