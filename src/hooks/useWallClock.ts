"use client";

/**
 * @file `useWallClock` — a `Date` value that ticks every second.
 */

import { useEffect, useState } from "react";

/**
 * Returns the current wall-clock time as a `Date`, refreshed once per
 * second. Useful for headers/footers that show the current time.
 *
 * Note: this hook fires a re-render every second, so colocate it with
 * the smallest component that needs the value to avoid unnecessary
 * work in larger trees.
 *
 * @returns A `Date` instance representing "now".
 *
 * @example
 * ```ts
 * const now = useWallClock();
 * return <WallClockDisplay date={now} />;
 * ```
 */
export function useWallClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
