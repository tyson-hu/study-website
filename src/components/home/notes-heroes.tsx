import { listQuizSets } from "@/lib/question-sets"

export function NotesHeroes() {
  const [lightSet, darkSet] = listQuizSets()

  return (
    <>
      <section className="bg-card px-6 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-foreground">
            {lightSet.title} notes.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-6 text-muted-foreground">
            Review concepts and terminology before you quiz.
          </p>
          <a
            href={lightSet.notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-base text-link hover:underline"
          >
            Open notes →
          </a>
        </div>
      </section>

      <section className="bg-primary px-6 py-16 text-primary-foreground md:py-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <h2 className="text-[32px] font-semibold tracking-[-1.28px]">
            {darkSet.title} notes.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-6 opacity-80">
            Deep-dive reference material for fundamentals topics.
          </p>
          <a
            href={darkSet.notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-base text-link-on-dark"
          >
            Open notes →
          </a>
        </div>
      </section>
    </>
  )
}
