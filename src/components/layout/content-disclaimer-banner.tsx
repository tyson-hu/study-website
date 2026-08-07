import { TriangleAlertIcon } from "lucide-react"

export function ContentDisclaimerBanner() {
  return (
    <aside
      role="note"
      aria-label="Content disclaimer"
      className="border-b border-[var(--warning-deep)]/20 bg-[var(--warning-soft)] text-[var(--warning-deep)] dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <div className="mx-auto flex max-w-3xl gap-3 px-4 py-3 sm:px-6">
        <TriangleAlertIcon
          className="mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1 text-sm leading-5">
          <p className="font-medium tracking-[-0.28px]">
            Exam content may change at any time
          </p>
          <p className="text-[13px] leading-5 opacity-90">
            Question source is from Blooket. Answers are only correct for the
            version at the time these notes were created. Confirm your test
            matches that version before studying. The author is not responsible
            for question sequence or later exam updates.
          </p>
        </div>
      </div>
    </aside>
  )
}
