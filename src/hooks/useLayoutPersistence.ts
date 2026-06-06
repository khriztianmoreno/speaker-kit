"use client";

/**
 * @file `useLayoutPersistence` — persist the SpeakerView splitter
 * sizes to `localStorage` so they survive reloads.
 */

import { useEffect, useState } from "react";

/**
 * Persisted layout state for the SpeakerView panels.
 */
export type LayoutState = {
  /** Width (px) of the right-hand notes pane. */
  notesWidth: number;
  /** Height (px) of the bottom "upcoming slide" preview. */
  upcomingHeight: number;
};

/**
 * Default layout used before hydration and as a fallback when stored
 * data is missing or malformed.
 */
const DEFAULT_LAYOUT: LayoutState = { notesWidth: 560, upcomingHeight: 220 };

/**
 * Reads a {@link LayoutState} from `localStorage`, defensively handling
 * SSR (no `window`), missing entries, and malformed JSON.
 *
 * Each numeric field is validated independently so a partially corrupt
 * record still falls back to per-field defaults rather than discarding
 * the whole layout.
 *
 * @param key `localStorage` key to read.
 * @returns Parsed layout or {@link DEFAULT_LAYOUT}.
 */
function loadLayout(key: string): LayoutState {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    return {
      notesWidth:
        typeof parsed.notesWidth === "number"
          ? parsed.notesWidth
          : DEFAULT_LAYOUT.notesWidth,
      upcomingHeight:
        typeof parsed.upcomingHeight === "number"
          ? parsed.upcomingHeight
          : DEFAULT_LAYOUT.upcomingHeight,
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

/**
 * Hook that mirrors a {@link LayoutState} value to `localStorage`.
 *
 * The initial render returns {@link DEFAULT_LAYOUT} to keep server and
 * client output identical (avoiding hydration mismatches). After mount
 * the stored value (if any) is loaded and persistence is enabled.
 *
 * @param storageKey Key to use under `localStorage`.
 * @returns
 *   - `layout`: current layout state.
 *   - `setLayout`: React state setter (supports updater fn).
 *   - `reset`: restore {@link DEFAULT_LAYOUT}.
 *
 * @example
 * ```ts
 * const { layout, setLayout, reset } = useLayoutPersistence(
 *   `speaker-kit:layout:${channel}`
 * );
 * ```
 */
export function useLayoutPersistence(storageKey: string) {
  const [layout, setLayout] = useState<LayoutState>(DEFAULT_LAYOUT);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setLayout(loadLayout(storageKey));
    setHydrated(true);
  }, [storageKey]);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {
      // quota or disabled — ignore
    }
  }, [layout, hydrated, storageKey]);

  /** Restore the default panel sizes. */
  const reset = () => setLayout(DEFAULT_LAYOUT);

  return { layout, setLayout, reset };
}

export { DEFAULT_LAYOUT };
