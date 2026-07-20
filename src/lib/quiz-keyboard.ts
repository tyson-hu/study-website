const LETTER_OFFSET = "a".charCodeAt(0);

/** Map A–H / 1–8 to 0-based option index. Returns null if not an option key. */
export function parseOptionIndex(key: string): number | null {
  if (key.length === 1) {
    const lower = key.toLowerCase();
    if (lower >= "a" && lower <= "h") {
      return lower.charCodeAt(0) - LETTER_OFFSET;
    }
    if (key >= "1" && key <= "8") {
      return Number(key) - 1;
    }
  }
  return null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function hasShortcutModifier(
  event: Pick<KeyboardEvent, "metaKey" | "ctrlKey" | "altKey">
): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}
