"use client";

/**
 * @file Audience-facing view: renders only the active slide, fullscreen,
 * following navigation broadcast by the connected `SpeakerView`.
 */

import { useEffect, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useSlideSync } from "../hooks/useSlideSync";
import type { SlideEntry } from "../types";

/**
 * Props for {@link AudienceView}.
 */
export type AudienceViewProps = {
  /** Same `slides` array the speaker uses — order must match. */
  slides: SlideEntry[];
  /** Channel slug — must match the SpeakerView's channel for them to sync. */
  channel: string;
  /** Supabase client. Required for cross-device sync; omit for same-browser only. */
  supabase?: SupabaseClient;
  /**
   * Keyboard shortcut that opens `/slides/speaker` in a popup window.
   * Pass `null` to disable. Defaults to "S".
   */
  openSpeakerOn?: string | null;
  /** Path to the speaker view. Defaults to "/slides/speaker". */
  speakerHref?: string;
  /** Render-prop slot for custom overlays (e.g. reactions). Receives current index + total. */
  overlay?: (ctx: { index: number; total: number }) => ReactNode;
  /** Hide the small bottom counter pill. */
  hideCounter?: boolean;
  /** Hide the bottom gradient progress bar. */
  hideProgress?: boolean;
};

/**
 * Audience view component.
 *
 * Subscribes to the configured sync channel as a follower (it never
 * broadcasts navigation), renders the active slide with a subtle
 * enter animation, and shows an optional counter pill and progress
 * bar at the bottom.
 *
 * An optional `overlay` render-prop allows callers to layer their own
 * UI (for example, audience reactions) on top of the slide.
 *
 * @example
 * ```tsx
 * <AudienceView
 *   slides={slides}
 *   channel="my-talk"
 *   supabase={supabaseClient}
 *   overlay={({ index, total }) => <Reactions slide={index} total={total} />}
 * />
 * ```
 */
export function AudienceView({
  slides,
  channel,
  supabase,
  openSpeakerOn = "S",
  speakerHref = "/slides/speaker",
  overlay,
  hideCounter = false,
  hideProgress = false,
}: AudienceViewProps) {
  const total = slides.length;
  const { index } = useSlideSync({
    total,
    channel,
    role: "audience",
    supabase,
  });

  useEffect(() => {
    if (!openSpeakerOn) return;
    /**
     * Opens the speaker view in a popup window when the configured
     * shortcut is pressed (case-insensitive). Skipped while the user
     * is focused on a form field so we don't hijack typing.
     */
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === openSpeakerOn.toLowerCase()) {
        e.preventDefault();
        window.open(
          speakerHref,
          "speaker-kit-speaker",
          "popup=yes,width=1280,height=800",
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openSpeakerOn, speakerHref]);

  const Current = slides[index]?.Component;
  if (!Current) return null;

  return (
    <div className="sk-audience">
      <div key={index} style={{ animation: "sk-slide-enter 0.25s ease-out both" }}>
        <Current />
      </div>

      {overlay?.({ index, total })}

      {!hideCounter ? (
        <div className="sk-audience__counter">
          {index + 1} / {total}
        </div>
      ) : null}

      {!hideProgress ? (
        <div className="sk-audience__progress">
          <div
            className="sk-audience__progress-bar"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
