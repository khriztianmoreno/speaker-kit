# Skill: @khriztianmoreno/speaker-kit

Use this skill whenever a user asks you to add a speaker view, audience view, slide sync, or presentation mode to a Next.js app.

---

## 1. Overview

`@khriztianmoreno/speaker-kit` adds two drop-in components to a Next.js app:

- **`<SpeakerView>`** — private page for the presenter. Shows the current slide, upcoming preview, markdown notes, elapsed + wall-clock timers, and resizable panels.
- **`<AudienceView>`** — public page for attendees. Shows only the current slide and follows whatever the speaker navigates to.

Slides are **plain React components** the user writes. This library handles sync, layout, and controls — not slide creation.

Sync runs on two tiers simultaneously:
- `BroadcastChannel` for same-browser tabs (<5 ms, no config needed).
- Supabase Realtime for cross-device sync (~80–200 ms, requires a Supabase project).

---

## 2. Prerequisites

Before generating any code, verify or ask the user to confirm:

1. **Framework**: Next.js ≥ 14 (App Router assumed; Pages Router also works).
2. **React**: ≥ 18.
3. **CSS import** must be present once in the app (layout or page):
   ```ts
   import "@khriztianmoreno/speaker-kit/styles.css";
   ```
4. **"use client"** directive is required on every page that uses `<SpeakerView>` or `<AudienceView>`.
5. **Supabase** (`@supabase/supabase-js ≥ 2`): only needed for cross-device sync. Omit it for same-browser-only use.

Install:
```bash
pnpm add @khriztianmoreno/speaker-kit
# optional — only for cross-device sync
pnpm add @supabase/supabase-js
```

---

## 3. Decision Tree

Work through these questions before writing code.

### 3.1 Sync scope
```
Does the user need cross-device sync (laptop → audience phones/laptops)?
├── YES → include supabase prop in both SpeakerView and AudienceView
└── NO  → omit supabase; BroadcastChannel handles same-browser tabs
```

### 3.2 Transport backend
```
Does the user want to use Pusher / Ably / WebSocket instead of Supabase?
├── YES → implement the Transport interface (see Section 8) and pass it via
│         useSlideSync({ transports: (defaults) => [new MyTransport()] })
└── NO  → use the built-in defaults (BroadcastChannel + optional Supabase)
```

### 3.3 Layout customization
```
Does the user want a fully custom UI instead of the pre-built speaker layout?
├── YES → use useSlideSync() hook directly + <SlidePreview>, <ElapsedDisplay>,
│         <WallClockDisplay>, <VSplitter>, <HSplitter> as building blocks
└── NO  → use <SpeakerView> as-is (handles layout, keyboard shortcuts, timers)
```

### 3.4 Role
```
Is the user building the page the audience sees?
├── YES → role = "audience" (goTo/goNext/goPrev are no-ops, read-only)
└── NO  → role = "speaker" (default; drives navigation and broadcasts events)
```

---

## 4. Core Integration Pattern

This is the canonical setup. Follow it unless the user specifies otherwise.

### Step 1 — Slide registry

```tsx
// app/_slides/registry.tsx
import type { SlideEntry } from "@khriztianmoreno/speaker-kit";
import { Cover, AboutMe, Closing } from "./slide-components";

export const SLIDES: SlideEntry[] = [
  { id: "cover",    Component: Cover,   title: "Cover"    },
  { id: "about-me", Component: AboutMe, title: "About me" },
  { id: "closing",  Component: Closing, title: "Closing"  },
];
```

> **Important:** define `SLIDES` outside of any component so the array reference is stable. Recreating it on every render causes unnecessary re-renders.

### Step 2 — Notes (optional)

```ts
// app/_slides/notes.ts
export const NOTES: Record<string, string> = {
  "cover":    "# Cover\n- Energy high, say hi.",
  "about-me": "# About me\n- 30 seconds max.",
  "closing":  "# Closing\n- Repeat the URL, then Q&A.",
};
```

Keys must match the `id` fields in the registry. Missing keys show a placeholder — not an error.

### Step 3 — Audience page (public route)

```tsx
// app/slides/page.tsx
"use client";
import { AudienceView } from "@khriztianmoreno/speaker-kit";
import { supabase } from "@/lib/supabase"; // omit if same-browser only
import { SLIDES } from "../_slides/registry";

export default function SlidesPage() {
  return (
    <AudienceView
      slides={SLIDES}
      channel="my-talk-2026"
      supabase={supabase}   // remove this line if no cross-device sync
    />
  );
}
```

### Step 4 — Speaker page (private route)

```tsx
// app/slides/speaker/page.tsx
"use client";
import { SpeakerView } from "@khriztianmoreno/speaker-kit";
import { supabase } from "@/lib/supabase";
import { SLIDES } from "../../_slides/registry";
import { NOTES }  from "../../_slides/notes";

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

### Step 5 — CSS (once, in layout or a global stylesheet)

```ts
import "@khriztianmoreno/speaker-kit/styles.css";
```

---

## 5. API Reference

### `<SpeakerView>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slides` | `SlideEntry[]` | ✓ | Ordered list of slides. |
| `channel` | `string` | ✓ | Must match the audience `channel`. |
| `notes` | `Record<string, string>` | | Markdown notes keyed by slide `id`. |
| `supabase` | `SupabaseClient` | | Required for cross-device sync. |
| `layoutKey` | `string` | | `localStorage` key for panel sizes. Default: `speaker-kit:layout:{channel}`. |

**Built-in keyboard shortcuts**

| Key | Action |
|---|---|
| `→` `↓` `Space` | Next slide |
| `←` `↑` | Previous slide |
| `T` | Reset elapsed timer |
| `⌘R` / `CtrlR` | Reset panel layout |

---

### `<AudienceView>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slides` | `SlideEntry[]` | ✓ | Same array as the speaker. |
| `channel` | `string` | ✓ | Must match the speaker `channel`. |
| `supabase` | `SupabaseClient` | | Required for cross-device sync. |
| `openSpeakerOn` | `string \| null` | | Key that opens the speaker view in a popup. Default `"S"`. Pass `null` to disable. |
| `speakerHref` | `string` | | Override the speaker route. Default `/slides/speaker`. |
| `overlay` | `(ctx) => ReactNode` | | Render-prop for custom overlays. |
| `hideCounter` | `boolean` | | Hide the built-in slide counter. |
| `hideProgress` | `boolean` | | Hide the progress bar. |

---

### `useSlideSync(options)` — low-level hook

Use this when the user wants a fully custom UI.

```ts
const { index, goTo, goNext, goPrev, role } = useSlideSync({
  total: SLIDES.length,  // required
  channel: "my-talk",   // required
  role: "speaker",       // "speaker" | "audience", default "speaker"
  supabase,              // optional
  transports: (defaults) => [...defaults], // optional override
});
```

- `goTo(n)` — no-op if `role === "audience"`.
- `goNext()` / `goPrev()` — clamp at 0 and `total - 1`.

---

### `SlideEntry` type

```ts
type SlideEntry = {
  id: string;              // stable key — used for notes lookup and React key
  Component: ComponentType; // the slide React component
  title?: string;          // shown in speaker header
};
```

---

### Building-block components (for custom UIs)

| Export | Description |
|---|---|
| `<SlidePreview>` | Scales a slide to fit its container, preserving aspect ratio. |
| `<ElapsedDisplay>` | Formatted elapsed timer pill (`HH:mm:ss`). |
| `<WallClockDisplay>` | Current time pill (`HH:mm`). |
| `<VSplitter>` / `<HSplitter>` | Resizable panel dividers. |
| `formatElapsed(ms)` | Utility: `number → "HH:mm:ss"`. |

---

## 6. Common Errors → Fixes

| Symptom | Root cause | Fix |
|---|---|---|
| Hydration mismatch or "window is not defined" | Missing `"use client"` on the page | Add `"use client"` as the very first line of the page file. |
| Components render unstyled | Missing CSS import | Add `import "@khriztianmoreno/speaker-kit/styles.css"` to the layout or page. |
| Audience view never updates | `channel` string differs between speaker and audience pages | Make both pages use the exact same string. Extract it to a constant. |
| Cross-device sync doesn't work | `supabase` prop is missing or `undefined` | Pass a valid `SupabaseClient` to both views; verify the Supabase URL and anon key are correct. |
| Audience can navigate slides | Role is not set or set to `"speaker"` on audience page | `AudienceView` sets role to `"audience"` internally — do not pass it to `useSlideSync` directly unless building a custom UI. |
| Timer shows `NaN` | `elapsedMs` is `undefined` | `elapsedMs` from `useElapsed` is always a number; check it's being passed correctly to `<ElapsedDisplay>`. |
| Notes not showing | Note key doesn't match slide `id` | Keys in the `NOTES` object must be identical to `id` values in `SLIDES`. |

---

## 7. Anti-patterns

**Do not define `SLIDES` inside a component.** A new array reference on every render breaks React's key reconciliation and causes unnecessary unmount/remount cycles.

```tsx
// ❌ wrong
export default function Page() {
  const SLIDES = [{ id: "cover", Component: Cover }]; // new ref every render
  return <SpeakerView slides={SLIDES} ... />;
}

// ✓ correct — define outside the component
const SLIDES: SlideEntry[] = [{ id: "cover", Component: Cover }];
export default function Page() {
  return <SpeakerView slides={SLIDES} ... />;
}
```

**Do not use the same `channel` in development and production at the same time.** Running `next dev` locally while the production URL is open with an identical channel string makes localhost drive the live audience. Use a distinct channel in `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_SLIDE_CHANNEL=my-talk-dev
```

**Do not call `goTo` / `goNext` / `goPrev` from an audience client.** These are no-ops when `role === "audience"`, but calling them is a sign the role is wrong. Audience views are follower-only by design.

**Do not omit `"use client"` thinking SSR will help.** Both views rely on browser APIs (`BroadcastChannel`, `localStorage`, Supabase WebSocket). They must run in the client.

**Do not skip the CSS import to save bytes.** The stylesheet is required for layout. Without it, the speaker view panels collapse and the UI breaks.

---

## 8. Custom Transport Template

Use this when the user wants to replace or augment Supabase with Pusher, Ably, SSE, or any other pubsub backend.

```ts
import type { SyncMsg, Transport } from "@khriztianmoreno/speaker-kit";

export class MyTransport implements Transport {
  // Called by the hook to broadcast a message to all other subscribers.
  send(msg: SyncMsg): void {
    // e.g. pusherChannel.trigger("client-sync", msg)
  }

  // Called once by the hook to register an incoming-message handler.
  // Must return an unsubscribe function.
  subscribe(handler: (msg: SyncMsg) => void): () => void {
    // e.g. pusherChannel.bind("client-sync", handler)
    return () => {
      // e.g. pusherChannel.unbind("client-sync", handler)
    };
  }

  // Optional. Called after subscribe. Use it to trigger a request-state
  // so late joiners snap to the current slide immediately.
  onReady(cb: () => void): void {
    // call cb once when the connection is established
  }

  // Called on component unmount. Clean up sockets, listeners, etc.
  close(): void {
    // e.g. pusherChannel.unsubscribe()
  }
}
```

Pass it via the `transports` factory:

```ts
useSlideSync({
  total: SLIDES.length,
  channel: "my-talk",
  // replace defaults entirely
  transports: () => [new MyTransport()],
  // — or — augment defaults (keeps BroadcastChannel + Supabase)
  transports: (defaults) => [...defaults, new MyTransport()],
});
```
