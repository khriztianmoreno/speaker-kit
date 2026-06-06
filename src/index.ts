/**
 * @file Public entry point for the `speaker-kit` package.
 *
 * Re-exports the high-level views, building-block components, hooks,
 * transports, and shared types that consumers may import.
 *
 * @example
 * ```tsx
 * import { SpeakerView, AudienceView } from "speaker-kit";
 * ```
 *
 * @packageDocumentation
 */

// ─── Top-level components ──────────────────────────────────────

/**
 * Speaker-facing view: shows the current slide, upcoming slide,
 * notes, timers, and navigation controls.
 */
export { SpeakerView } from "./components/SpeakerView";
export type { SpeakerViewProps } from "./components/SpeakerView";

/**
 * Audience-facing view: renders only the current slide, fullscreen,
 * and follows whatever the speaker is showing.
 */
export { AudienceView } from "./components/AudienceView";
export type { AudienceViewProps } from "./components/AudienceView";

// ─── Building blocks (for custom UIs) ──────────────────────────

/**
 * Renders a slide component scaled to fit a container while preserving
 * its virtual aspect ratio. Useful when assembling a custom layout.
 */
export { SlidePreview } from "./components/SlidePreview";
export type { SlidePreviewProps } from "./components/SlidePreview";

/**
 * Resizable splitter primitives used by `SpeakerView`. Exposed so
 * consumers can compose their own panel layouts.
 */
export { VSplitter, HSplitter } from "./components/Splitter";

/**
 * Display helpers for the elapsed timer and the wall clock,
 * plus the `formatElapsed` utility for raw millisecond values.
 */
export { ElapsedDisplay, WallClockDisplay, formatElapsed } from "./components/Timer";

// ─── Hooks ─────────────────────────────────────────────────────

/** Hook that keeps a slide index in sync across roles via configured transports. */
export { useSlideSync } from "./hooks/useSlideSync";
export type { UseSlideSyncOptions } from "./hooks/useSlideSync";

/** Hook returning a `Date` that ticks every second. */
export { useWallClock } from "./hooks/useWallClock";

/** Hook returning the milliseconds elapsed since a given start timestamp. */
export { useElapsed } from "./hooks/useElapsed";

/** Hook that persists the SpeakerView splitter layout to `localStorage`. */
export { useLayoutPersistence, DEFAULT_LAYOUT } from "./hooks/useLayoutPersistence";
export type { LayoutState } from "./hooks/useLayoutPersistence";

// ─── Transports ────────────────────────────────────────────────

/** Same-browser transport based on the `BroadcastChannel` API. */
export { BroadcastChannelTransport } from "./transports/broadcast-channel";

/** Cross-device transport built on top of Supabase Realtime broadcast. */
export { SupabaseTransport } from "./transports/supabase";

// ─── Types ─────────────────────────────────────────────────────

export type {
  SlideEntry,
  SyncRole,
  SyncMsg,
  NavMsg,
  ReqStateMsg,
  Transport,
} from "./types";
