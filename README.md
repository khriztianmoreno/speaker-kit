<div align="center">

<img src="https://github.com/khriztianmoreno/speaker-kit/blob/main/assets/logo.png?raw=true" alt="speaker-kit logo" width="220" />

# @khriztianmoreno/speaker-kit

**Speaker-mode presentation kit for Next.js.**
Drop-in **speaker view** (notes, timer, upcoming preview, resizable panels) and **audience view** (follower-only), synced across browsers and devices via Supabase Realtime + BroadcastChannel.

[![npm version](https://img.shields.io/npm/v/@khriztianmoreno/speaker-kit?color=22d3ee&label=npm&style=flat-square)](https://www.npmjs.com/package/@khriztianmoreno/speaker-kit)
[![npm downloads](https://img.shields.io/npm/dm/@khriztianmoreno/speaker-kit?color=ff7849&style=flat-square)](https://www.npmjs.com/package/@khriztianmoreno/speaker-kit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@khriztianmoreno/speaker-kit?color=22d3ee&label=minzip&style=flat-square)](https://bundlephobia.com/package/@khriztianmoreno/speaker-kit)
[![types](https://img.shields.io/npm/types/@khriztianmoreno/speaker-kit?style=flat-square&color=ff7849)](https://www.npmjs.com/package/@khriztianmoreno/speaker-kit)
[![license](https://img.shields.io/npm/l/@khriztianmoreno/speaker-kit?color=8a8aa0&style=flat-square)](./LICENSE)

[**Install**](#install) · [**Quick start**](#quick-start) · [**API**](#api) · [**Theming**](#theming) · [**How it works**](#how-it-works) · [**FAQ**](#faq) · [**Development**](./DEVELOPMENT.md)

</div>

---

## Why speaker-kit?

> Most "slide" libraries make you adopt a whole framework. **speaker-kit** is the opposite — your slides stay as plain React components, and you drop in two views (`SpeakerView` + `AudienceView`) that stay in sync.

- **Real speaker mode** — current slide, upcoming preview, markdown notes, elapsed + wall clock timers, resizable panels (persisted to `localStorage`).
- **Follower-only audience** — anyone with the URL sees what you're showing; nobody can hijack the deck.
- **Two-tier sync** — `BroadcastChannel` for same-browser tabs (<5ms) and Supabase Realtime for cross-device (~80–200ms). Both run together.
- **Pluggable transports** — Pusher, Ably, SSE, your own WebSocket? Implement a 4-method interface and swap it in.
- **No CSS framework required** — ships its own stylesheet with CSS variable theming. Tailwind-friendly but not Tailwind-dependent.
- **TypeScript-first** — full `.d.ts` with rich JSDoc on every public API.

## Install

```bash
pnpm add @khriztianmoreno/speaker-kit
# peer dep — only needed if you want cross-device sync
pnpm add @supabase/supabase-js
```

```ts
import "@khriztianmoreno/speaker-kit/styles.css";
```

> **Heads-up:** `react`, `react-dom` and `next` are peer dependencies. `@supabase/supabase-js` is an **optional** peer — omit it and you'll still get same-browser sync via `BroadcastChannel`.

## Quick start

### 1. Define your slides

Slides are plain React components. Each one gets a stable `id` for note lookup.

```tsx
// app/_slides/registry.tsx
import type { SlideEntry } from "@khriztianmoreno/speaker-kit";
import { Cover, AboutMe, Closing } from "./slide-components";

export const SLIDES: SlideEntry[] = [
  { id: "cover", Component: Cover, title: "Cover" },
  { id: "about-me", Component: AboutMe, title: "About me" },
  { id: "closing", Component: Closing, title: "Closing" },
];
```

### 2. Provide notes (markdown strings)

Inline strings, a separate `.ts` file, or `.md` imports — your call. Keys must match slide `id`s.

```ts
// app/_slides/notes.ts
export const NOTES: Record<string, string> = {
  cover: "# Cover\n- Energy high, smile, say hi.",
  "about-me": "# About me\n- 30 seconds max.\n- Mention badges.",
  closing: "# Closing\n- Repeat the URL.\n- Q&A.",
};
```

### 3. Audience view (the public URL — `/slides`)

```tsx
// app/slides/page.tsx
"use client";
import { AudienceView } from "@khriztianmoreno/speaker-kit";
import { supabase } from "@/lib/supabase";
import { SLIDES } from "../_slides/registry";

export default function SlidesPage() {
  return (
    <AudienceView
      slides={SLIDES}
      channel="my-talk-2026"
      supabase={supabase}
    />
  );
}
```

Anyone who lands on `/slides` follows whatever the speaker shows. They cannot navigate.

### 4. Speaker view (private — `/slides/speaker`)

```tsx
// app/slides/speaker/page.tsx
"use client";
import { SpeakerView } from "@khriztianmoreno/speaker-kit";
import { supabase } from "@/lib/supabase";
import { SLIDES } from "../../_slides/registry";
import { NOTES } from "../../_slides/notes";

export default function SpeakerPage() {
  return (
    <SpeakerView
      slides={SLIDES}
      notes={NOTES}
      channel="my-talk-2026"
      supabase={supabase}
    />
  );
}
```

Open `/slides/speaker` on your laptop. Arrow keys / space advance. The audience view follows in real time.

## Patterns for notes

<details>
<summary><b>A. Inline strings (zero config)</b></summary>

Best for one-off talks. Keep everything in one file:

```ts
export const NOTES = {
  cover: `
# Cover
- Punchline first.
- 3-second pause.
  `,
  // ...
};
```

</details>

<details>
<summary><b>B. <code>.md</code> imports (one rule in <code>next.config.js</code>)</b></summary>

If you want notes in their own `.md` files:

```js
// next.config.js
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
};
```

```ts
// app/_slides/notes.ts
import cover from "./notes/cover.md";
import aboutMe from "./notes/about-me.md";

export const NOTES = { cover, "about-me": aboutMe };
```

And a TypeScript declaration so the `.md` import typechecks:

```ts
// app/_slides/md.d.ts
declare module "*.md" {
  const content: string;
  export default content;
}
```

</details>

## API

### `<SpeakerView />`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slides` | `SlideEntry[]` | ✓ | Ordered list of slide entries. |
| `notes` | `Record<string, string>` | | Map `id → markdown`. Missing keys render a placeholder. |
| `channel` | `string` | ✓ | Channel slug; **must match** the audience view's `channel`. |
| `supabase` | `SupabaseClient` | | Required for cross-device sync; omit for same-browser only. |
| `layoutKey` | `string` | | localStorage key for splitter sizes. Defaults to `speaker-kit:layout:{channel}`. |

**Keyboard shortcuts in speaker view**

| Key | Action |
|---|---|
| `→` `↓` `Space` | Next slide |
| `←` `↑` | Previous slide |
| `T` | Reset elapsed timer |
| `⌘R` / `CtrlR` | Reset layout to defaults |

Drag the thin bars between panels to resize. Sizes are persisted in `localStorage` per channel.

### `<AudienceView />`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slides` | `SlideEntry[]` | ✓ | Must be the same array as the speaker. |
| `channel` | `string` | ✓ | Matches the speaker's `channel`. |
| `supabase` | `SupabaseClient` | | Required for cross-device sync. |
| `openSpeakerOn` | `string \| null` | | Key that opens `/slides/speaker` in a popup. Defaults to `"S"`. Pass `null` to disable. |
| `speakerHref` | `string` | | Override the speaker view path. Default `/slides/speaker`. |
| `overlay` | `(ctx) => ReactNode` | | Render-prop for custom overlays (counters, reactions, etc.). |
| `hideCounter` / `hideProgress` | `boolean` | | Hide the built-in bottom counter / progress bar. |

### `useSlideSync(options)`

Low-level hook for custom UIs.

```ts
const { index, goNext, goPrev, goTo } = useSlideSync({
  total: SLIDES.length,
  channel: "my-talk",
  role: "speaker", // or "audience"
  supabase,
});
```

`audience` role makes `goTo`/`goNext`/`goPrev` no-ops; only `speaker` instances can drive the deck.

### Transports

The hook accepts a `transports` factory if you want to swap or augment the defaults:

```ts
useSlideSync({
  /* ... */
  transports: (defaults) => [...defaults, new MyCustomTransport()],
});
```

Implement the `Transport` interface (`send`, `subscribe`, `onReady?`, `close`) and you can replace Supabase with Pusher, Ably, SSE — anything pubsub-shaped.

## Theming

All colors live in CSS variables. Override in your own stylesheet **after** importing `styles.css`:

```css
:root {
  --sk-bg: #1a1a2e;
  --sk-accent: #ff6b9d;
  --sk-orange: #f5af19;
}
```

<details>
<summary><b>Available CSS variables</b></summary>

| Variable | Default | Purpose |
|---|---|---|
| `--sk-bg` | `#0a0a14` | Page background |
| `--sk-panel` | `#14141f` | Header / notes / panel surfaces |
| `--sk-panel-2` | `#1c1c2a` | Buttons + table headers |
| `--sk-border` | `#2a2a3a` | Panel borders, dividers |
| `--sk-border-strong` | `#3a3a4a` | Button borders |
| `--sk-text` | `#ffffff` | Primary text |
| `--sk-text-soft` | `#c8cad6` | Body text |
| `--sk-text-muted` | `#8a8aa0` | Labels |
| `--sk-text-dim` | `#6a6a82` | Disabled |
| `--sk-accent` | `#22d3ee` | Cyan accent (timer, primary button) |
| `--sk-orange` | `#ff7849` | "Upcoming" label, blockquote |
| `--sk-radius` | `16px` | Panel border radius |
| `--sk-font-mono` / `--sk-font-sans` | system | Typography |

</details>

## How it works

- **Same browser** sync uses `BroadcastChannel` (instant, no network).
- **Cross device** sync uses Supabase Realtime broadcast on a channel named `speaker-kit:{channel}`.
- The `useSlideSync` hook combines both — same-tab gets the fast path, other devices catch up via Supabase.
- **Roles:** the `speaker` view emits navigation events and responds to `request-state`. The `audience` view only listens. Result: anyone with the URL follows along but cannot drive the deck.
- **Late join:** when an audience joins, it broadcasts `request-state`. Only a speaker replies, so the new tab snaps to the current slide.

```
┌──────────────┐   navigate    ┌──────────────────┐   navigate   ┌──────────────┐
│  SpeakerView │ ────────────► │  BroadcastChannel│ ───────────► │ AudienceView │
│  (driver)    │               │  (same browser)  │              │  (followers) │
│              │               └──────────────────┘              │              │
│              │   navigate    ┌──────────────────┐   navigate   │              │
│              │ ────────────► │ Supabase Realtime│ ───────────► │              │
│              │               │  (cross device)  │              │              │
└──────────────┘               └──────────────────┘              └──────────────┘
```

## FAQ

<details>
<summary><b>Do I need Supabase?</b></summary>

Only for cross-device sync. Same-browser (multiple windows on the same machine) works without it via BroadcastChannel.

</details>

<details>
<summary><b>Can I use Pusher / Ably / WebSocket instead?</b></summary>

Yes — implement the `Transport` interface and pass it via the `transports` factory in `useSlideSync`.

</details>

<details>
<summary><b>Can I use this without Tailwind?</b></summary>

Yes. The package ships its own stylesheet (`speaker-kit.css`) using CSS variables. No Tailwind anywhere.

</details>

<details>
<summary><b>Multiple presentations at once?</b></summary>

Use different `channel` slugs. Each is an isolated pubsub channel.

</details>

<details>
<summary><b>Footgun: driving prod from localhost</b></summary>

If you run `pnpm dev` locally **and** your prod URL is open at the same time with the same `channel`, you'll drive prod from localhost. Either use a different `channel` value in `.env.local`, or close prod while you develop.

</details>

## Contributing

Want to hack on speaker-kit itself? The [DEVELOPMENT.md](./DEVELOPMENT.md) guide covers cloning, local dev with `tsup --watch`, linking against a Next.js app, releases and troubleshooting.

## License

MIT © [Cristian Moreno](https://github.com/khriztianmoreno)

<div align="center">
<sub>Built with care for speakers who want speaker mode <i>without</i> giving up React.</sub>
</div>
