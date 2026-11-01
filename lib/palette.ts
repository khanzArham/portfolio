// Pure helpers for the command palette (plan §6.6), kept here so they can be
// unit tested without rendering the dialog.

/** The keys that open and close the palette: Cmd + K on a Mac, Ctrl + K elsewhere. */
export function isPaletteShortcut(event: KeyboardEvent): boolean {
  // Either modifier works on every platform, so a Windows keyboard on a Mac
  // (or the reverse) still opens it. Shift is tolerated (Caps Lock gives
  // "K"); Alt combinations belong to other shortcuts.
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    event.key.toLowerCase() === "k"
  );
}

/**
 * True when every word of the query appears somewhere in the texts.
 * cmdk's own fuzzy filter is off, because search results from the index
 * must not be filtered a second time.
 */
export function matchesQuery(query: string, ...texts: string[]): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = texts.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}
