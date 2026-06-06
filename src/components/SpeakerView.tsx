"use client";

/**
 * @file Speaker-facing view: current slide + upcoming slide + notes
 * + timers + navigation, all kept in sync with any audience clients.
 */

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useSlideSync } from "../hooks/useSlideSync";
import { useWallClock } from "../hooks/useWallClock";
import { useElapsed } from "../hooks/useElapsed";
import { useLayoutPersistence } from "../hooks/useLayoutPersistence";

import { SlidePreview } from "./SlidePreview";
import { VSplitter, HSplitter } from "./Splitter";
import { ElapsedDisplay, WallClockDisplay } from "./Timer";
import { ChevronLeft, ChevronRight } from "../icons";

import type { SlideEntry } from "../types";

/**
 * Props for {@link SpeakerView}.
 */
export type SpeakerViewProps = {
  /** Ordered list of slides to render. */
  slides: SlideEntry[];
  /**
   * Map of `slideId -> markdown notes`. Missing entries fall back to a
   * placeholder. Notes are rendered with GFM markdown support.
   */
  notes?: Record<string, string>;
  /** Channel slug — must match the AudienceView's channel for them to sync. */
  channel: string;
  /** Supabase client. Required for cross-device sync; omit for same-browser only. */
  supabase?: SupabaseClient;
  /** localStorage key for persisting splitter sizes. Defaults to `speaker-kit:layout:{channel}`. */
  layoutKey?: string;
};

/**
 * Speaker view component.
 *
 * Renders a header with the current slide counter, elapsed and
 * wall-clock timers, and previous/next controls; a main area with
 * the current slide on top, an "upcoming" preview below, and a
 * resizable notes pane on the right.
 *
 * Keyboard shortcuts:
 *  - `→ / ↓ / Space` — next slide
 *  - `← / ↑` — previous slide
 *  - `T` — (re)start the elapsed timer
 *  - `Cmd/Ctrl + R` — reset the persisted splitter layout
 *
 * The elapsed timer auto-starts the first time the speaker advances
 * past the first slide.
 *
 * @example
 * ```tsx
 * <SpeakerView
 *   slides={slides}
 *   notes={notes}
 *   channel="my-talk"
 *   supabase={supabaseClient}
 * />
 * ```
 */
export function SpeakerView({
  slides,
  notes = {},
  channel,
  supabase,
  layoutKey,
}: SpeakerViewProps) {
  const total = slides.length;
  const { index, goNext, goPrev } = useSlideSync({
    total,
    channel,
    role: "speaker",
    supabase,
  });

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useWallClock();
  const elapsed = useElapsed(startedAt);

  const { layout, setLayout, reset } = useLayoutPersistence(
    layoutKey ?? `speaker-kit:layout:${channel}`,
  );

  // Auto-start timer on first nav
  useEffect(() => {
    if (startedAt === null && index > 0) {
      setStartedAt(Date.now());
    }
  }, [index, startedAt]);

  useEffect(() => {
    /**
     * Global keyboard handler. Ignores keys typed inside `INPUT` /
     * `TEXTAREA` elements so the shortcuts don't fight with form fields.
     */
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        goNext();
      } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setStartedAt(Date.now());
      } else if ((e.key === "r" || e.key === "R") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, reset]);

  /**
   * Resize callback for the vertical splitter that controls the notes
   * panel width. `dx` is the cursor delta in CSS pixels — positive when
   * the user drags right. The notes panel sits on the right side, so we
   * subtract `dx` to grow when dragging left.
   *
   * @param dx Horizontal mouse delta in pixels.
   */
  const onResizeNotes = useCallback(
    (dx: number) => {
      setLayout((prev) => {
        const max = Math.max(320, window.innerWidth - 400);
        const min = 280;
        return {
          ...prev,
          notesWidth: Math.max(min, Math.min(max, prev.notesWidth - dx)),
        };
      });
    },
    [setLayout],
  );

  /**
   * Resize callback for the horizontal splitter that controls the
   * height of the "upcoming slide" preview. `dy` is the cursor delta
   * in CSS pixels — positive when dragging down.
   *
   * @param dy Vertical mouse delta in pixels.
   */
  const onResizeUpcoming = useCallback(
    (dy: number) => {
      setLayout((prev) => {
        const max = Math.max(160, window.innerHeight - 320);
        const min = 90;
        return {
          ...prev,
          upcomingHeight: Math.max(min, Math.min(max, prev.upcomingHeight - dy)),
        };
      });
    },
    [setLayout],
  );

  const current = slides[index];
  const next = slides[index + 1] ?? null;
  const markdown = notes[current.id] ?? "_(no notes for this slide)_";

  return (
    <div className="sk-root">
      {/* Header */}
      <header className="sk-header sk-panel">
        <div className="sk-header__left">
          <span className="sk-tag">Slide</span>
          <span className="sk-counter">
            {index + 1}
            <span className="sk-counter__sep"> / {total}</span>
          </span>
          {current.title ? (
            <span className="sk-title">{current.title}</span>
          ) : null}
        </div>

        <div className="sk-header__right">
          <ElapsedDisplay
            elapsedMs={elapsed}
            onReset={() => setStartedAt(Date.now())}
          />
          <WallClockDisplay date={now} />

          <div className="sk-header__divider">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="sk-icon-btn"
              title="Previous slide (←)"
              aria-label="Previous slide"
            >
              <ChevronLeft width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={index === total - 1}
              className="sk-icon-btn sk-icon-btn--primary"
              title="Next slide (→)"
              aria-label="Next slide"
            >
              <ChevronRight width={20} height={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main row: [current/upcoming column] | VSplitter | [notes column] */}
      <div className="sk-main">
        <div className="sk-left-col">
          <SlidePreview
            Component={current.Component}
            style={{ flex: 1, minHeight: 0 }}
          />

          <HSplitter onResize={onResizeUpcoming} />

          {next ? (
            <div className="sk-upcoming" style={{ height: layout.upcomingHeight }}>
              <span className="sk-upcoming__label">Upcoming</span>
              <SlidePreview
                Component={next.Component}
                style={{ height: "100%", flex: 1 }}
              />
            </div>
          ) : (
            <div
              className="sk-upcoming__empty"
              style={{ height: layout.upcomingHeight }}
            >
              Last slide
            </div>
          )}
        </div>

        <VSplitter onResize={onResizeNotes} />

        <aside
          className="sk-notes"
          style={{ width: layout.notesWidth }}
        >
          <div className="sk-notes__header">
            <span className="sk-tag">Notes</span>
            <span className="sk-notes__id">{current.id}</span>
          </div>
          <div className="sk-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        </aside>
      </div>
    </div>
  );
}
