export function ContentNotice() {
  return (
    <aside
      aria-label="Content and affiliation notice"
      className="border-b border-border bg-[var(--canvas-soft)] px-6 py-2.5"
    >
      <details className="group mx-auto max-w-[1200px] text-xs leading-5 text-muted-foreground">
        <summary className="cursor-pointer marker:text-[var(--mute)]">
          <strong className="font-medium text-foreground">
            Independent educational project.
          </strong>{" "}
          View content and affiliation details.
        </summary>
        <p className="mt-2 max-w-4xl pb-1">
          Some quiz material is based on Cisco-related networking course
          content; Blooket was a discovery or delivery source for some
          questions. Content can change, so verify it against current course
          materials. This project is not affiliated with or endorsed by Cisco,
          Cisco Networking Academy, Blooket, the U.S. Army, the Department of
          Defense, or any educational institution.
        </p>
      </details>
    </aside>
  )
}
