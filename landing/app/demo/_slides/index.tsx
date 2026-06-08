import type { SlideEntry } from "@khriztianmoreno/speaker-kit";

const base: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0a14",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
  padding: "40px",
  textAlign: "center",
};

function SlideTitle() {
  return (
    <div style={base}>
      <p style={{ fontSize: "0.85rem", letterSpacing: "0.15em", color: "#22d3ee", marginBottom: 16, fontWeight: 600 }}>
        LIVE DEMO
      </p>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
        speaker-kit
      </h1>
      <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "#c8cad6", maxWidth: 500, lineHeight: 1.5 }}>
        Drop-in speaker mode for Next.js.<br />Your slides stay as plain React components.
      </p>
    </div>
  );
}

function SlideFeatures() {
  const items = [
    { icon: "🎭", title: "Speaker view", desc: "Notes, timer, upcoming preview" },
    { icon: "👥", title: "Audience view", desc: "Follower-only, read-only" },
    { icon: "⚡", title: "Two-tier sync", desc: "BroadcastChannel + Supabase" },
    { icon: "🔌", title: "Custom transports", desc: "Pusher, Ably, WebSocket…" },
  ];
  return (
    <div style={base}>
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#22d3ee", marginBottom: 12, fontWeight: 600 }}>
        WHAT YOU GET
      </p>
      <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>
        Everything a speaker needs
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 680, width: "100%" }}>
        {items.map((f) => (
          <div key={f.title} style={{ background: "#14141f", border: "1px solid #2a2a3a", borderRadius: 12, padding: "18px 20px", textAlign: "left" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
            <div style={{ fontSize: "0.82rem", color: "#8a8aa0" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideInstall() {
  return (
    <div style={base}>
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#22d3ee", marginBottom: 12, fontWeight: 600 }}>
        GET STARTED
      </p>
      <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 32 }}>
        One command away
      </h2>
      <div style={{ background: "#14141f", border: "1px solid #2a2a3a", borderRadius: 12, padding: "16px 24px", fontFamily: "monospace", fontSize: "clamp(0.85rem, 2vw, 1.1rem)", color: "#22d3ee", marginBottom: 24 }}>
        <span style={{ color: "#8a8aa0", userSelect: "none" }}>$ </span>
        pnpm add @khriztianmoreno/speaker-kit
      </div>
      <p style={{ color: "#8a8aa0", fontSize: "0.875rem" }}>
        React ≥ 18 · Next.js ≥ 14 · TypeScript-first · MIT
      </p>
    </div>
  );
}

function SlideTransports() {
  return (
    <div style={base}>
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "#ff7849", marginBottom: 12, fontWeight: 600 }}>
        ADVANCED
      </p>
      <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
        Pluggable transports
      </h2>
      <p style={{ color: "#c8cad6", maxWidth: 480, marginBottom: 28, lineHeight: 1.5 }}>
        Implement a 4-method interface to swap in any pubsub backend.
      </p>
      <div style={{ background: "#14141f", border: "1px solid #2a2a3a", borderRadius: 12, padding: "20px 24px", fontFamily: "monospace", fontSize: "0.8rem", textAlign: "left", maxWidth: 520, width: "100%", lineHeight: 1.8 }}>
        <span style={{ color: "#818cf8" }}>interface </span>
        <span style={{ color: "#ff7849" }}>Transport</span>
        {" {"}<br />
        {"  "}<span style={{ color: "#22d3ee" }}>send</span>{"(msg: SyncMsg): "}<span style={{ color: "#818cf8" }}>void</span>{";"}<br />
        {"  "}<span style={{ color: "#22d3ee" }}>subscribe</span>{"(fn): "}<span style={{ color: "#818cf8" }}>{"() => void"}</span>{";"}<br />
        {"  "}<span style={{ color: "#22d3ee" }}>onReady</span>{"?(cb): "}<span style={{ color: "#818cf8" }}>void</span>{";"}<br />
        {"  "}<span style={{ color: "#22d3ee" }}>close</span>{"(): "}<span style={{ color: "#818cf8" }}>void</span>{";"}<br />
        {"}"}
      </div>
    </div>
  );
}

export const DEMO_SLIDES: SlideEntry[] = [
  { id: "title",      Component: SlideTitle,      title: "Intro"       },
  { id: "features",   Component: SlideFeatures,   title: "Features"    },
  { id: "install",    Component: SlideInstall,     title: "Get started" },
  { id: "transports", Component: SlideTransports, title: "Transports"  },
];

export const DEMO_NOTES: Record<string, string> = {
  title: `# Intro
- Welcome to the speaker-kit demo
- Navigate with **arrow keys** or **Space**
- This panel shows your speaker notes
- The timer on the left tracks elapsed time`,

  features: `# Features
- **Speaker view**: notes, timer, upcoming preview, resizable panels
- **Audience view**: follower-only — nobody hijacks your deck
- Two-tier sync: BroadcastChannel (<5ms) + Supabase (~100ms)
- Pluggable transports: drop in Pusher, Ably, or your own WebSocket`,

  install: `# Get started
\`\`\`bash
pnpm add @khriztianmoreno/speaker-kit
\`\`\`
- Peer deps: react ≥ 18, next ≥ 14
- Optional: @supabase/supabase-js for cross-device sync
- Import the stylesheet once, then drop in SpeakerView + AudienceView`,

  transports: `# Custom transports
- Implement the \`Transport\` interface (4 methods)
- Pass it via the \`transports\` factory in \`useSlideSync\`
- Augment defaults: \`transports: (d) => [...d, new MyTransport()]\`
- Replace defaults: \`transports: () => [new MyTransport()]\``,
};
