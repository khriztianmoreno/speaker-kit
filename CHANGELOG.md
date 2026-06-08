# Changelog

All notable changes to **`@khriztianmoreno/speaker-kit`** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

—

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

[Unreleased]: https://github.com/khriztianmoreno/speaker-kit/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/khriztianmoreno/speaker-kit/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/khriztianmoreno/speaker-kit/releases/tag/v1.0.0
