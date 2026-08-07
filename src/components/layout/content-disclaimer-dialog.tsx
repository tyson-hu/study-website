"use client"

import { useSyncExternalStore } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "tysons-notes-disclaimer-accepted"
const ACCEPTED_EVENT = "tysons-notes-disclaimer-change"

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(ACCEPTED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(ACCEPTED_EVENT, onStoreChange)
  }
}

function readAccepted(): boolean {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return true
    // Migrate older session-only acceptance so refresh keeps working.
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
      window.localStorage.setItem(STORAGE_KEY, "1")
      return true
    }
    return false
  } catch {
    return false
  }
}

function setAccepted() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1")
  } catch {
    // Still continue for this page load if storage is blocked.
  }
  window.dispatchEvent(new Event(ACCEPTED_EVENT))
}

export function ContentDisclaimerDialog() {
  // Server snapshot is `true` so returning visitors never flash the dialog
  // during hydration. First-time visitors see it once the client snapshot loads.
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true)

  if (accepted) return null

  return (
    <Dialog
      defaultOpen
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        // Block backdrop / Escape dismissals until the user confirms.
        if (!nextOpen) eventDetails.cancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
        role="alertdialog"
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <TriangleAlertIcon
              className="mt-0.5 size-5 shrink-0 text-[var(--warning-deep)] dark:text-amber-300"
              aria-hidden="true"
            />
            <div className="space-y-3">
              <DialogTitle>Exam content may change at any time</DialogTitle>
              <DialogDescription className="space-y-3 text-left">
                <p>Please read before you continue:</p>
                <ul className="list-disc space-y-2 pl-4 marker:text-[var(--warning-deep)] dark:marker:text-amber-300">
                  <li>Question source is from Blooket.</li>
                  <li>
                    Answers are only correct for the version at the time these
                    notes were created.
                  </li>
                  <li>
                    Confirm your test matches that version before studying.
                  </li>
                  <li>
                    The author is not responsible for question sequence or later
                    exam updates.
                  </li>
                </ul>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              window.close()
              window.location.replace("about:blank")
            }}
          >
            No
          </Button>
          <Button onClick={setAccepted}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
