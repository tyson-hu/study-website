const SESSION_FLAG = "study-web:quiz-compatible";

/** True when localStorage + CustomEvent can support persisted quiz progress. */
export function isPersistedProgressSupported(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = "__study_web_storage_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return typeof window.CustomEvent === "function";
  } catch {
    return false;
  }
}

export function isCompatibleModePreferred(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(SESSION_FLAG) === "1") return true;
  } catch {
    // sessionStorage may also be blocked
  }

  return !isPersistedProgressSupported();
}

export function preferCompatibleMode(): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // Ignore — in-memory compatible mode still works for this page load.
  }
}

export function withCompatibleSearchParam(pathname: string): string {
  const url = new URL(pathname, "http://local.invalid");
  url.searchParams.set("compatible", "1");
  return `${url.pathname}?${url.searchParams.toString()}`;
}
