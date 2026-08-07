import { HeroBand } from "@/components/home/hero-band"
import { StudySetCards } from "@/components/home/study-set-cards"
import { ContentDisclaimerDialog } from "@/components/layout/content-disclaimer-dialog"
import { SiteHeader } from "@/components/layout/site-header"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <ContentDisclaimerDialog />
      <main>
        <HeroBand />
        <StudySetCards />
      </main>
    </div>
  )
}
