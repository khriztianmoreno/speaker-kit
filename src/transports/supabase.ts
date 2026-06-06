/**
 * @file `SupabaseTransport` — cross-device {@link Transport}
 * implementation built on top of Supabase Realtime broadcast.
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { SyncMsg, Transport } from "../types";

/**
 * Cross-device transport. Uses Supabase Realtime broadcast.
 *
 * Latency: ~80–200ms depending on region.
 *
 * The consumer provides their own `SupabaseClient` instance — we never
 * create one to avoid duplicate clients and to let the consumer manage
 * auth/env vars. The transport uses `{ self: false }` so the sender
 * does not receive its own messages back.
 *
 * @example
 * ```ts
 * const t = new SupabaseTransport(supabase, "speaker-kit:my-talk");
 * t.subscribe((msg) => apply(msg));
 * t.onReady(() => t.send({ type: "request-state", senderId: "abc" }));
 * ```
 */
export class SupabaseTransport implements Transport {
  private channel: RealtimeChannel | null = null;
  private readyCb: (() => void) | null = null;

  /**
   * @param client      Configured Supabase client (with realtime enabled).
   * @param channelName Realtime channel name. Should match across all
   *   participants on the same logical channel.
   */
  constructor(
    private client: SupabaseClient,
    private channelName: string,
  ) {}

  /**
   * Sends a `SyncMsg` as a Realtime broadcast event.
   * Noop until {@link subscribe} has created the underlying channel.
   *
   * @param msg Message to broadcast.
   */
  send(msg: SyncMsg) {
    this.channel?.send({ type: "broadcast", event: "sync", payload: msg });
  }

  /**
   * Joins the Realtime channel and registers `handler` for every
   * `sync` broadcast.
   *
   * The internal `subscribe(status)` callback fires `onReady` once
   * the channel reaches the `"SUBSCRIBED"` state, which is when the
   * sync hook should request the current state.
   *
   * @param handler Callback invoked with each incoming message.
   * @returns Unsubscribe function that leaves the channel.
   */
  subscribe(handler: (msg: SyncMsg) => void): () => void {
    this.channel = this.client.channel(this.channelName, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        handler(payload as SyncMsg);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.readyCb?.();
        }
      });

    return () => {
      this.channel?.unsubscribe();
      this.channel = null;
    };
  }

  /**
   * Registers a callback fired the first time the Realtime channel
   * reaches the `"SUBSCRIBED"` state.
   *
   * @param cb Callback invoked once when the channel is ready.
   */
  onReady(cb: () => void) {
    this.readyCb = cb;
  }

  /** Leaves the Realtime channel. Safe to call repeatedly. */
  close() {
    this.channel?.unsubscribe();
    this.channel = null;
  }
}
