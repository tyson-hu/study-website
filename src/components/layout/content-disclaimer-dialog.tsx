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
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(ACCEPTED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(ACCEPTED_EVENT, onStoreChange)
  }
}

function getAcceptedSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY) === "1"
}

function getServerSnapshot() {
  return false
}

function setAccepted() {
  sessionStorage.setItem(STORAGE_KEY, "1")
  window.dispatchEvent(new Event(ACCEPTED_EVENT))
}

export function ContentDisclaimerDialog() {
  const accepted = useSyncExternalStore(
    subscribe,
    getAcceptedSnapshot,
    getServerSnapshot
  )

  return (
    <Dialog open={!accepted} disablePointerDismissal onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        role="alertdialog"
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <TriangleAlertIcon
              className="mt-0.5 size-5 shrink-0 text-[var(--warning-deep)] dark:text-amber-300"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <DialogTitle>Exam content may change at any time</DialogTitle>
              <DialogDescription>
                Question source is from Blooket. Answers are only correct for
                the version at the time these notes were created. Confirm your
                test matches that version before studying. The author is not
                responsible for question sequence or later exam updates.
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
