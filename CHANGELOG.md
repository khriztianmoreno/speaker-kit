# Changelog

All notable changes to **`@khriztianmoreno/speaker-kit`** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

—

## [1.1.1] - 2026-06-14

### Fixed

- **`<SpeakerView>`** mobile layout. On phones (`≤768px`) the view now
  collapses to a compact header (elapsed / wall-clock timers + navigation
  controls) pinned at the top, with the speaker notes filling the rest of
  the screen. The slide previews and the resizable splitter — which were
  cramped and unusable on small screens — are hidden, and the slide title is
  dropped to keep the header from overflowing.

## [1.1.0] - 2026-06-08

### Changed

- **`<AudienceView>`** now lets viewers navigate locally with the keyboard
  (`←` / `→` / `↑` / `↓` / `Space`). When a speaker is connected and broadcasts
  a `navigate` event, every audience client still snaps to the canonical index,
  so the speaker remains in control during a live talk. This makes a single
  `/slides` URL work both during the presentation **and** after it ends — late
  visitors can browse the deck at their own pace instead of seeing a frozen view.
- **`useSlideSync`** — the `audience` role's `goTo` / `goNext` / `goPrev` now
  update local state instead of being no-ops. Broadcasting is still gated:
  `emit` continues to drop `navigate` payloads for the audience role, so
  audience navigation stays purely local and never leaks onto the channel.

### Migration notes

Backwards compatible at the API level — no prop or signature changed. If your
app relied on the audience being completely frozen (e.g. a kiosk display),
override the behavior by rendering `<AudienceView>` inside a wrapper that
swallows keyboard events, or build a custom UI on top of `useSlideSync`
with `role: "audience"` and ignore the returned `goTo` / `goNext` / `goPrev`.

## [1.0.1] - 2026-06-08

### Added

- **`skill.md`** — agent-oriented integration guide shipped inside the published package.
  It documents the library in imperative, copy-pasteable form so that LLM-based coding
  agents (Cursor, Claude Code, Copilot, etc.) can integrate `speaker-kit` correctly on
  the first try.
  Includes:
  - Overview and prerequisites tailored for agents.
  - Decision tree (BroadcastChannel only vs. Supabase vs. custom transport).
  - Full `speaker + audience` integration pattern, ready to copy.
  - Concise API reference tables.
  - Common errors → fixes mapping.
  - Anti-patterns to avoid.
  - Custom `Transport` skeleton template.

### Changed

- `package.json` — `files` field now includes `skill.md`, so the file is shipped with
  the npm tarball and available at `node_modules/@khriztianmoreno/speaker-kit/skill.md`.

## [1.0.0] - 2026-06-06

Initial public release.

### Added

- **Components**
  - `<SpeakerView>` — full speaker layout with current slide, upcoming preview,
    markdown notes, elapsed + wall-clock timers, navigation controls and
    resizable panels.
  - `<AudienceView>` — follower-only fullscreen slide view with optional counter,
    progress bar, overlay render-prop and configurable speaker-popup shortcut.
  - `<SlidePreview>` — scales a slide component to its container while preserving
    a fixed virtual viewport (default `1440 × 900`).
  - `<VSplitter>` / `<HSplitter>` — draggable separators used by the speaker layout.
  - `<ElapsedDisplay>` / `<WallClockDisplay>` and the `formatElapsed` helper.
- **Hooks**
  - `useSlideSync` — central hook that keeps the slide index in sync across roles
    and transports. Supports a custom `transports` factory.
  - `useElapsed` — milliseconds elapsed since a start timestamp, ticking every second.
  - `useWallClock` — `Date` value updated every second.
  - `useLayoutPersistence` — persists splitter sizes to `localStorage` with
    SSR-safe hydration.
- **Transports**
  - `BroadcastChannelTransport` — same-browser sync (<5 ms) with a safe noop
    fallback when `BroadcastChannel` is unavailable.
  - `SupabaseTransport` — cross-device sync via Supabase Realtime broadcast,
    using a consumer-provided `SupabaseClient`.
- **Types** — `SlideEntry`, `SyncRole`, `SyncMsg`, `NavMsg`, `ReqStateMsg`,
  `Transport`, plus prop types for every component and hook.
- **Styling** — `speaker-kit.css` shipped as a separate import
  (`@khriztianmoreno/speaker-kit/styles.css`) with CSS variables for theming
  (no Tailwind required).
- **Tooling**
  - Dual build (ESM + CJS + `.d.ts`) via `tsup`, with stylesheet auto-copied to
    `dist/styles.css`.
  - Vitest test suite with `@testing-library/react` and `happy-dom`.
  - Full JSDoc coverage on every exported symbol.
- **Docs**
  - `README.md` with quick start, API tables, theming and FAQ.
  - `DEVELOPMENT.md` covering local setup, `tsup --watch` loop, linking against a
    consumer Next.js app, release flow and troubleshooting.
  - MIT `LICENSE`.

[Unreleased]: https://github.com/khriztianmoreno/speaker-kit/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/khriztianmoreno/speaker-kit/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/khriztianmoreno/speaker-kit/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/khriztianmoreno/speaker-kit/releases/tag/v1.0.0
