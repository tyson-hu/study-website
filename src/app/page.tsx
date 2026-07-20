import { HeroBand } from "@/components/home/hero-band"
import { NotesHeroes } from "@/components/home/notes-heroes"
import { QuizSetCards } from "@/components/home/quiz-set-cards"
import { SiteHeader } from "@/components/layout/site-header"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <main>
        <HeroBand />
        <QuizSetCards />
        <NotesHeroes />
      </main>
    </div>
  )
}
