import { MeshGradient } from "@/components/ui/mesh-gradient"

export function HeroBand() {
  return (
    <section className="relative overflow-hidden bg-card px-6 py-16 md:py-24 lg:py-32">
      <MeshGradient />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <p className="font-mono text-xs text-[var(--mute)]">IT networking study</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-2.4px] text-foreground">
          Study Web.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
          Study networking with focused quizzes.
        </p>
      </div>
    </section>
  )
}
