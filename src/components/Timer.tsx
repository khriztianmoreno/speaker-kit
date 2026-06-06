"use client";

/**
 * @file Time-related display components used in the speaker header.
 *
 * Exposes:
 *  - {@link formatElapsed}: format a millisecond duration as `HH:mm:ss`.
 *  - {@link ElapsedDisplay}: pill showing the elapsed timer (with reset).
 *  - {@link WallClockDisplay}: pill showing the current `HH:mm` wall time.
 */

import { Clock, RotateCcw, Timer as TimerIcon } from "../icons";

/**
 * Pads a non-negative integer to 2 digits with leading zeros.
 *
 * @param n Integer to pad.
 * @returns A two-character string (e.g. `7 -> "07"`).
 */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Formats a millisecond duration as a zero-padded `HH:mm:ss` string.
 *
 * @param ms Duration in milliseconds. Negative values are treated as 0
 *   by truncation.
 * @returns Formatted string, e.g. `"01:23:45"`.
 *
 * @example
 * ```ts
 * formatElapsed(3_725_000); // "01:02:05"
 * ```
 */
export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Pill that displays an elapsed time and an optional reset button.
 *
 * @param props.elapsedMs Elapsed milliseconds to display.
 * @param props.onReset   Optional handler. When provided, a reset
 *   button is rendered next to the value.
 */
export function ElapsedDisplay({
  elapsedMs,
  onReset,
}: {
  elapsedMs: number;
  onReset?: () => void;
}) {
  return (
    <div className="sk-time">
      <TimerIcon width={16} height={16} className="sk-time__icon" />
      <span className="sk-time__value sk-time__value--accent">
        {formatElapsed(elapsedMs)}
      </span>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="sk-reset-btn"
          title="Reset timer (T)"
          aria-label="Reset timer"
        >
          <RotateCcw width={14} height={14} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Pill that displays the wall-clock time (`HH:mm`) for a given `Date`.
 *
 * @param props.date `Date` instance to render. Pair with the
 *   {@link useWallClock} hook to keep it ticking.
 */
export function WallClockDisplay({ date }: { date: Date }) {
  return (
    <div className="sk-time">
      <Clock width={16} height={16} />
      <span className="sk-time__value">
        {pad(date.getHours())}:{pad(date.getMinutes())}
      </span>
    </div>
  );
}
