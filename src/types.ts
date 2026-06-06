/**
 * @file Shared type definitions used across components, hooks, and transports.
 */

import type { ComponentType } from "react";

/**
 * Describes a single slide in the deck.
 *
 * Each entry pairs a stable `id` with the React component that renders
 * the slide. The `id` is also used as the lookup key for speaker notes.
 */
export type SlideEntry = {
  /** Stable identifier — used to look up notes and as a React key. */
  id: string;
  /** The slide component itself. */
  Component: ComponentType;
  /** Optional title shown in the speaker view header. */
  title?: string;
};

/**
 * Role of a participant connected to a sync channel.
 *
 * - `"speaker"` owns the canonical slide index and broadcasts navigation.
 * - `"audience"` is read-only and only follows broadcasts.
 */
export type SyncRole = "speaker" | "audience";

/**
 * Broadcast message indicating the deck has navigated to `index`.
 *
 * Sent by speakers whenever the slide changes (and as a response to
 * `request-state` messages so late joiners can catch up).
 */
export type NavMsg = {
  type: "navigate";
  /** Zero-based index of the slide that should now be active. */
  index: number;
  /** Unique id of the sender — used to ignore self-echoes. */
  senderId: string;
  /** Wall-clock timestamp in milliseconds (`Date.now()`). */
  ts: number;
};

/**
 * Broadcast message asking any speaker on the channel to reply with
 * the current `NavMsg`. Useful when an audience client joins late.
 */
export type ReqStateMsg = {
  type: "request-state";
  /** Unique id of the sender — used to ignore self-echoes. */
  senderId: string;
};

/** Union of all sync messages exchanged through a {@link Transport}. */
export type SyncMsg = NavMsg | ReqStateMsg;

/**
 * Minimal pubsub interface the sync hook talks to.
 *
 * Built-in implementations:
 *  - {@link BroadcastChannelTransport} (same browser, instant)
 *  - {@link SupabaseTransport} (cross-device)
 *
 * Any custom transport that fulfills this contract works as a drop-in.
 */
export interface Transport {
  /** Publish a message to every other subscriber on the channel. */
  send(msg: SyncMsg): void;
  /**
   * Register a handler invoked for every incoming message.
   *
   * @returns Unsubscribe function that detaches the handler.
   */
  subscribe(handler: (msg: SyncMsg) => void): () => void;
  /** Called after subscribe completes successfully. Hook uses this to request initial state. */
  onReady?(cb: () => void): void;
  /** Tear down resources held by the transport (sockets, channels, listeners). */
  close(): void;
}
