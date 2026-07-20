import { Suspense } from "react";
import { notFound } from "next/navigation";

import { QuizShell } from "@/components/quiz/quiz-shell";
import {
  getQuizSet,
  isQuizMode,
  isQuizSetId,
  QUIZ_SET_IDS,
} from "@/lib/question-sets";
import type { QuizMode } from "@/types/question";

export function generateStaticParams() {
  const modes: QuizMode[] = ["practice", "test"];
  return QUIZ_SET_IDS.flatMap((set) =>
    modes.map((mode) => ({ set, mode }))
  );
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ set: string; mode: string }>;
}) {
  const { set, mode } = await params;
  if (!isQuizSetId(set) || !isQuizMode(mode)) notFound();
  const meta = getQuizSet(set);

  return (
    <Suspense fallback={null}>
      <QuizShell setId={set} questionSet={meta.questionSet} mode={mode} />
    </Suspense>
  );
}
