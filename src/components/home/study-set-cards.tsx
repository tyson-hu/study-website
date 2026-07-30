import Link from "next/link"

import {
  StudySetMedia,
  type StudySetMediaVariant,
} from "@/components/home/study-set-media"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { listQuizSets } from "@/lib/question-sets"
import { cn } from "@/lib/utils"

const mediaLabels: Record<string, string> = {
  essentials: "Essentials",
  fundamentals: "Fundamentals",
}

const mediaVariants: Record<string, StudySetMediaVariant> = {
  essentials: "meteors",
  fundamentals: "glyph",
}

export function StudySetCards() {
  const quizSets = listQuizSets()

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-foreground">
          Choose your set.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {quizSets.map((set) => (
            <Card
              key={set.id}
              className="shadow-elevation-3 border-border bg-card p-6 md:p-8"
            >
              <StudySetMedia
                label={mediaLabels[set.id] ?? set.title}
                variant={mediaVariants[set.id] ?? "glyph"}
              />
              <CardHeader className="mt-6 px-0">
                <CardTitle className="text-2xl font-semibold tracking-[-0.96px] text-foreground">
                  {set.title}
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  {set.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <p className="font-mono text-xs text-[var(--mute)]">
                  {set.questionSet.totalQuestions} questions
                </p>
              </CardContent>
              <CardFooter className="mt-6 flex flex-wrap gap-3 border-0 bg-transparent px-0">
                <Link
                  href={`/quiz/${set.id}/practice`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-11 rounded-lg px-5 text-base"
                  )}
                >
                  Practice
                </Link>
                <Link
                  href={`/quiz/${set.id}/test`}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "h-11 rounded-lg px-5 text-base"
                  )}
                >
                  Test
                </Link>
                <a
                  href={set.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 rounded-lg px-5 text-base"
                  )}
                >
                  Notes
                </a>
              </CardFooter>
            </Card>
          ))}

          <Card className="shadow-elevation-3 border-border bg-card p-6 md:p-8">
            <StudySetMedia label="Army Net" variant="particles" />
            <CardHeader className="mt-6 px-0">
              <CardTitle className="text-2xl font-semibold tracking-[-0.96px] text-foreground">
                Army Net
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Network and Active Directory lab guide: switch, router, DNS,
                DHCP, and user builds.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <p className="font-mono text-xs text-[var(--mute)]">
                Lab reference
              </p>
            </CardContent>
            <CardFooter className="mt-6 flex flex-wrap gap-3 border-0 bg-transparent px-0">
              <Link
                href="/army-net"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-11 rounded-lg px-5 text-base"
                )}
              >
                Open guide
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
