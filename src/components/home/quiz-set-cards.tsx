import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { listQuizSets } from "@/lib/question-sets"
import { cn } from "@/lib/utils"

export function QuizSetCards() {
  const quizSets = listQuizSets()

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-foreground">
          Choose your question set.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {quizSets.map((set) => (
            <article
              key={set.id}
              className="shadow-elevation-3 flex flex-col rounded-lg bg-card p-6 md:p-8"
            >
              <h3 className="text-2xl font-semibold tracking-[-0.96px] text-foreground">
                {set.title}
              </h3>
              <p className="mt-2 text-base leading-6 text-muted-foreground">
                {set.description}
              </p>
              <p className="mt-4 font-mono text-xs text-[var(--mute)]">
                {set.questionSet.totalQuestions} questions
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/quiz/${set.id}/practice`}
                  className={cn(buttonVariants({ variant: "default", size: "pill" }))}
                >
                  Practice
                </Link>
                <Link
                  href={`/quiz/${set.id}/test`}
                  className={cn(buttonVariants({ variant: "secondary", size: "pill" }))}
                >
                  Test
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
