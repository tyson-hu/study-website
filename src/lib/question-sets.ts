import type { QuestionSet, QuizMode } from "@/types/question";
import networkEssentialsData from "@/data/network-essentials.json";
import networkFundamentalsData from "@/data/network-fundamentals.json";

export type QuizSetId = "essentials" | "fundamentals";

export interface QuizSetMeta {
  id: QuizSetId;
  title: string;
  description: string;
  questionSet: QuestionSet;
  notesUrl: string;
  notesLabel: string;
}

const essentials = networkEssentialsData as QuestionSet;
const fundamentals = networkFundamentalsData as QuestionSet;

const catalog: Record<QuizSetId, QuizSetMeta> = {
  essentials: {
    id: "essentials",
    title: "Networking Essentials",
    description: "IPv6, addressing, and essentials practice exam questions.",
    questionSet: essentials,
    notesUrl:
      "https://app.notion.com/p/Networking-Essentials-3755f826b2fc80e1bf6fcc7ce710233f?source=copy_link",
    notesLabel: "Networking Essentials notes",
  },
  fundamentals: {
    id: "fundamentals",
    title: "Network Fundamentals",
    description: "Routing, switching, and core networking fundamentals.",
    questionSet: fundamentals,
    notesUrl:
      "https://app.notion.com/p/Network-Fundamental-3955f826b2fc80538519d4592037c110?source=copy_link",
    notesLabel: "Network Fundamentals notes",
  },
};

export const QUIZ_SET_IDS: QuizSetId[] = ["essentials", "fundamentals"];

export function isQuizSetId(value: string): value is QuizSetId {
  return value === "essentials" || value === "fundamentals";
}

export function isQuizMode(value: string): value is QuizMode {
  return value === "practice" || value === "test";
}

export function getQuizSet(id: QuizSetId): QuizSetMeta {
  return catalog[id];
}

export function listQuizSets(): QuizSetMeta[] {
  return QUIZ_SET_IDS.map((id) => catalog[id]);
}
