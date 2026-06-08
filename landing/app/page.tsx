export default function Home() {
  return (
    <>
      {/* ── Nav ─────────────────────────────────────── */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            speaker<span>-kit</span>
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="https://github.com/khriztianmoreno/speaker-kit" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.npmjs.com/package/@khriztianmoreno/speaker-kit" target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
              npm
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="hero">
        <div className="badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
          v1.0.1 · MIT License
        </div>

        <h1>
          Speaker mode for<br />
          <em>Next.js presentations</em>
        </h1>

        <p>
          Drop in two components, keep your slides as plain React. Real-time
          sync across tabs and devices — no framework lock-in.
        </p>

        <div className="shields">
          <img src="https://img.shields.io/npm/v/@khriztianmoreno/speaker-kit?color=22d3ee&label=npm&style=flat-square" alt="npm version" />
          <img src="https://img.shields.io/npm/dm/@khriztianmoreno/speaker-kit?color=ff7849&style=flat-square" alt="downloads" />
          <img src="https://img.shields.io/bundlephobia/minzip/@khriztianmoreno/speaker-kit?color=22d3ee&label=minzip&style=flat-square" alt="bundle size" />
          <img src="https://img.shields.io/npm/types/@khriztianmoreno/speaker-kit?style=flat-square&color=ff7849" alt="types" />
        </div>

        <div className="install-block">
          <span className="dollar">$</span>
          pnpm add @khriztianmoreno/speaker-kit
        </div>

        <div className="hero-actions">
          <a href="#demo" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Live demo
          </a>
          <a href="https://github.com/khriztianmoreno/speaker-kit" target="_blank" rel="noopener" className="btn btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
            GitHub
          </a>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="features" id="features">
        <div className="container">
          <p className="section-label">What you get</p>
          <h2 className="section-title">Everything a speaker needs</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎭</div>
              <h3>Real speaker mode</h3>
              <p>Current slide, upcoming preview, markdown notes, elapsed + wall-clock timers, resizable panels persisted to localStorage.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Follower-only audience</h3>
              <p>Anyone with the URL sees what you&apos;re showing. Nobody can hijack the deck — audience role is read-only by design.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Two-tier sync</h3>
              <p>BroadcastChannel for same-browser tabs (&lt;5ms) and Supabase Realtime for cross-device sync (~80–200ms). Both run together.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔌</div>
              <h3>Pluggable transports</h3>
              <p>Pusher, Ably, SSE, your own WebSocket? Implement a 4-method interface and swap it in. No lock-in.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>CSS variable theming</h3>
              <p>Ships its own stylesheet with CSS variable theming. Tailwind-friendly but not Tailwind-dependent. Override any token.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🦾</div>
              <h3>TypeScript-first</h3>
              <p>Full .d.ts with rich JSDoc on every public API. Slides are plain React components — no special format required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo ────────────────────────────────────── */}
      <section className="demo-section" id="demo">
        <div className="container">
          <p className="section-label">Try it now</p>
          <h2 className="section-title">Open both views side by side</h2>
          <p className="demo-description">
            Open the speaker view on one tab and the audience view on another.
            Navigate with arrow keys and watch the audience follow in real time.
          </p>

          <div className="demo-cards">
            <a href="/demo/speaker" target="_blank" rel="noopener" className="demo-card">
              <div className="demo-card-icon">🎤</div>
              <h3>Speaker view</h3>
              <p>Notes, timers, upcoming preview, keyboard navigation</p>
              <span className="btn btn-primary" style={{ justifyContent: "center" }}>Open speaker</span>
            </a>
            <a href="/demo/audience" target="_blank" rel="noopener" className="demo-card">
              <div className="demo-card-icon">🖥️</div>
              <h3>Audience view</h3>
              <p>Follows the speaker. Open this on a second screen or tab</p>
              <span className="btn btn-outline" style={{ justifyContent: "center" }}>Open audience</span>
            </a>
          </div>

          <p className="demo-hint">
            Sync works via <strong>BroadcastChannel</strong> — no server needed for same-browser tabs.
          </p>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="how-section" id="how">
        <div className="container">
          <p className="section-label">How it works</p>
          <h2 className="section-title">Quick start in 4 steps</h2>

          <div className="code-block">
            <span className="cmt">{"// 1. Define your slides (plain React components)"}</span>{"\n"}
            <span className="kw">export const </span>SLIDES<span className="kw">: </span><span className="tag">SlideEntry</span>[] = [{"\n"}
            {"  "}{"{ id: "}<span className="str">&quot;cover&quot;</span>{", Component: Cover, title: "}<span className="str">&quot;Cover&quot;</span>{" },"}{"\n"}
            {"  "}{"{ id: "}<span className="str">&quot;demo&quot;</span>{",  Component: Demo,  title: "}<span className="str">&quot;Demo&quot;</span>{"  },"}{"\n"}
            {"];"}{"\n\n"}
            <span className="cmt">{"// 2. Audience page (public route)"}</span>{"\n"}
            <span className="kw">&lt;</span><span className="tag">AudienceView</span>{" slides={SLIDES} channel="}<span className="str">&quot;my-talk&quot;</span>{" supabase={supabase} "}<span className="kw">/&gt;</span>{"\n\n"}
            <span className="cmt">{"// 3. Speaker page (private route)"}</span>{"\n"}
            <span className="kw">&lt;</span><span className="tag">SpeakerView</span>{" slides={SLIDES} notes={NOTES} channel="}<span className="str">&quot;my-talk&quot;</span>{" supabase={supabase} "}<span className="kw">/&gt;</span>{"\n\n"}
            <span className="cmt">{"// 4. Import the stylesheet once"}</span>{"\n"}
            <span className="kw">import </span><span className="str">&quot;@khriztianmoreno/speaker-kit/styles.css&quot;</span>
          </div>

          <div className="arch-diagram">{`┌──────────────┐   navigate    ┌────────────────────┐   navigate   ┌──────────────┐
│  SpeakerView │ ────────────► │  BroadcastChannel  │ ───────────► │ AudienceView │
│  (driver)    │               │  (same browser)    │              │  (followers) │
│              │               └────────────────────┘              │              │
│              │   navigate    ┌────────────────────┐   navigate   │              │
│              │ ────────────► │  Supabase Realtime │ ───────────► │              │
│              │               │  (cross device)    │              │              │
└──────────────┘               └────────────────────┘              └──────────────┘`}</div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer>
        <p>
          Built with care by{" "}
          <a href="https://github.com/khriztianmoreno" target="_blank" rel="noopener">
            @khriztianmoreno
          </a>{" "}
          ·{" "}
          <a href="https://github.com/khriztianmoreno/speaker-kit" target="_blank" rel="noopener">
            GitHub
          </a>{" "}
          ·{" "}
          <a href="https://www.npmjs.com/package/@khriztianmoreno/speaker-kit" target="_blank" rel="noopener">
            npm
          </a>{" "}
          · MIT License
        </p>
      </footer>
    </>
  );
}
