/**
 * @file Lightweight inline SVG icons used by the speaker UI.
 *
 * Each icon accepts standard SVG props so callers can override `width`,
 * `height`, `className`, etc. They share a common stroke style based on
 * `currentColor`, so they inherit the surrounding text color.
 */

import type { SVGProps } from "react";

/** Common props for every icon component in this module. */
type IconProps = SVGProps<SVGSVGElement>;

/**
 * Default attributes applied to every SVG icon.
 *
 * Stroke color is `currentColor` so the icon adopts the parent's
 * text color, which makes them easy to theme.
 */
const base = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Left-pointing chevron (used for "previous slide" controls). */
export function ChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/** Right-pointing chevron (used for "next slide" controls). */
export function ChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Wall-clock icon (used by the wall clock display). */
export function Clock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Stopwatch / timer icon (used by the elapsed timer display). */
export function Timer(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}

/** Counter-clockwise rotation icon (used by reset buttons). */
export function RotateCcw(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
