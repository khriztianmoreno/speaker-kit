"use client";

/**
 * @file `useElapsed` — milliseconds since a fixed start timestamp,
 * refreshed every second so consuming UI stays current.
 */

import { useEffect, useState } from "react";

/**
 * Returns ms elapsed since `startedAt`. Ticks every second so the UI updates.
 *
 * Returns `0` when `startedAt` is `null`, which is convenient for
 * "timer not yet started" states. Internal `setTick` only forces a
 * re-render — the actual elapsed value is recomputed from `Date.now()`
 * on each render to stay accurate even if a tick is delayed.
 *
 * @param startedAt Wall-clock timestamp (e.g. `Date.now()`) or `null`.
 * @returns Elapsed milliseconds, or `0` if not started.
 *
 * @example
 * ```ts
 * const [startedAt, setStartedAt] = useState<number | null>(null);
 * const elapsed = useElapsed(startedAt);
 * ```
 */
export function useElapsed(startedAt: number | null): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (startedAt === null) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  return startedAt === null ? 0 : Date.now() - startedAt;
}
