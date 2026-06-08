"use client";

/**
 * @file `useSlideSync` — keeps a slide index in sync across clients
 * connected to the same channel through one or more transports.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SyncMsg, SyncRole, Transport } from "../types";
import { BroadcastChannelTransport } from "../transports/broadcast-channel";
import { SupabaseTransport } from "../transports/supabase";

/**
 * Options accepted by {@link useSlideSync}.
 */
export type UseSlideSyncOptions = {
  /** Total number of slides. Used to clamp the index on incoming messages. */
  total: number;
  /** Channel slug. Combined with the `speaker-kit:` prefix internally. */
  channel: string;
  /** Role for this client. Defaults to `"speaker"`. */
  role?: SyncRole;
  /** Optional. Required for cross-device sync; without it, only same-browser sync works. */
  supabase?: SupabaseClient;
  /** Override the default transports. Receives a default list, returns the list to use. */
  transports?: (defaults: Transport[]) => Transport[];
};

/**
 * Generates a unique sender id used to filter out our own echoes when
 * messages bounce back through a transport.
 *
 * Falls back to `Math.random + Date.now` in environments without
 * `crypto.randomUUID` (older browsers, some test runners).
 *
 * @returns A reasonably unique string identifier.
 */
function genSenderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * React hook that keeps a slide index in sync across all clients
 * connected to the same `channel`.
 *
 * Behavior:
 *  - Speakers own the canonical index. Calling `goTo`, `goNext` or
 *    `goPrev` updates local state and broadcasts a `navigate` message.
 *  - Audiences are followers: their `goTo` is a no-op to prevent
 *    desync. They only react to incoming `navigate` messages.
 *  - On mount, every client emits a `request-state` message so any
 *    speaker on the channel responds with the current index. This
 *    lets late joiners catch up.
 *
 * Default transports:
 *  - {@link BroadcastChannelTransport} (always)
 *  - {@link SupabaseTransport} (when `supabase` is provided)
 *
 * The optional `transports` factory can replace or extend that list
 * for tests or custom backends.
 *
 * @returns Object with the current `index`, navigation helpers, and `role`.
 *
 * @example
 * ```ts
 * const { index, goNext, goPrev } = useSlideSync({
 *   total: slides.length,
 *   channel: "my-talk",
 *   role: "speaker",
 *   supabase,
 * });
 * ```
 */
export function useSlideSync(opts: UseSlideSyncOptions) {
  const { total, channel, role = "speaker", supabase, transports } = opts;

  const [index, setIndex] = useState(0);
  const senderIdRef = useRef<string>("");
  const indexRef = useRef(0);
  const transportsRef = useRef<Transport[]>([]);

  if (!senderIdRef.current) {
    senderIdRef.current = genSenderId();
  }

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const fullChannelName = `speaker-kit:${channel}`;

  /**
   * Build a `SyncMsg` and fan it out to every active transport.
   *
   * Audiences are not allowed to broadcast `navigate` (only follow),
   * so those calls are silently dropped.
   *
   * @param payload Message kind plus the new index when navigating.
   */
  const emit = useCallback(
    (payload: { type: SyncMsg["type"]; index?: number }) => {
      // Audiences never broadcast navigation
      if (role === "audience" && payload.type === "navigate") return;

      const senderId = senderIdRef.current;
      const ts = Date.now();
      const msg: SyncMsg =
        payload.type === "navigate"
          ? { type: "navigate", index: payload.index ?? 0, senderId, ts }
          : { type: "request-state", senderId };

      for (const t of transportsRef.current) {
        t.send(msg);
      }
    },
    [role],
  );

  /**
   * Apply an incoming sync message to local state.
   *
   * Self-echoes (messages we sent ourselves) are ignored. Remote
   * `navigate` messages clamp the incoming index to a safe range.
   * Speakers respond to `request-state` messages by re-broadcasting
   * the current index so late joiners can catch up.
   *
   * @param msg Incoming message from any transport.
   */
  const applyMsg = useCallback(
    (msg: SyncMsg) => {
      // Ignore our own echoes
      if (msg.senderId === senderIdRef.current) return;

      if (msg.type === "navigate") {
        const clamped = Math.max(0, Math.min(total - 1, msg.index));
        setIndex(clamped);
      } else if (msg.type === "request-state") {
        // Only speakers respond — audiences don't own the canonical index
        if (role === "speaker") {
          emit({ type: "navigate", index: indexRef.current });
        }
      }
    },
    [total, role, emit],
  );

  // Wire up transports
  useEffect(() => {
    const defaults: Transport[] = [new BroadcastChannelTransport(fullChannelName)];
    if (supabase) {
      defaults.push(new SupabaseTransport(supabase, fullChannelName));
    }

    const list = transports ? transports(defaults) : defaults;
    transportsRef.current = list;

    const unsubs = list.map((t) => {
      const unsub = t.subscribe(applyMsg);
      t.onReady?.(() => {
        // Ask for current state when we join the channel
        emit({ type: "request-state" });
      });
      return unsub;
    });

    return () => {
      for (const unsub of unsubs) unsub();
      for (const t of list) t.close();
      transportsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullChannelName, supabase]);

  /**
   * Move to a specific slide index.
   *
   * Both roles update local state so audiences can browse the deck
   * at their own pace when no speaker is live. Only the speaker role
   * broadcasts the change; audience navigation stays local. When a
   * speaker is connected and emits a `navigate` message, every audience
   * client snaps to the canonical index — so a viewer can flip ahead
   * during a live talk but will be pulled back to the speaker's slide
   * on the next broadcast.
   *
   * @param next Target slide index (zero-based).
   */
  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      // `emit` already drops `navigate` payloads for the audience role,
      // so audience navigation stays purely local.
      emit({ type: "navigate", index: clamped });
    },
    [total, emit],
  );

  /** Advance to the next slide (no-op past the end). */
  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  /** Go back to the previous slide (no-op at the start). */
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  return { index, goTo, goNext, goPrev, role };
}
