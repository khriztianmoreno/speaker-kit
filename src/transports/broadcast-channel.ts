/**
 * @file `BroadcastChannelTransport` — a same-browser {@link Transport}
 * implementation backed by the native `BroadcastChannel` API.
 */

import type { SyncMsg, Transport } from "../types";

/**
 * Same-browser fast path. Works across tabs/windows of the same origin.
 *
 * Latency: <5ms. No network. Falls back to noop if `BroadcastChannel`
 * is unavailable (e.g. SSR or very old browsers), so it can be safely
 * instantiated unconditionally.
 *
 * @example
 * ```ts
 * const t = new BroadcastChannelTransport("speaker-kit:my-talk");
 * t.subscribe((msg) => console.log(msg));
 * t.send({ type: "request-state", senderId: "abc" });
 * ```
 */
export class BroadcastChannelTransport implements Transport {
  private bc: BroadcastChannel | null = null;
  private readyCb: (() => void) | null = null;

  /**
   * @param channelName Name of the underlying `BroadcastChannel`.
   *   Should be unique per logical channel (the hook prefixes with
   *   `speaker-kit:` to avoid collisions).
   */
  constructor(private channelName: string) {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.bc = new BroadcastChannel(channelName);
    }
  }

  /**
   * Publishes a message to every other tab subscribed to the channel.
   * Becomes a noop when `BroadcastChannel` is unavailable.
   *
   * @param msg Message to broadcast.
   */
  send(msg: SyncMsg) {
    this.bc?.postMessage(msg);
  }

  /**
   * Subscribes to messages on the channel.
   *
   * @param handler Callback invoked with each incoming message.
   * @returns Unsubscribe function. When `BroadcastChannel` is
   *   unavailable, this returns a noop unsubscribe so callers don't
   *   need to special-case it.
   */
  subscribe(handler: (msg: SyncMsg) => void): () => void {
    if (!this.bc) return () => {};
    const fn = (ev: MessageEvent<SyncMsg>) => handler(ev.data);
    this.bc.addEventListener("message", fn);
    // BroadcastChannel is ready synchronously
    queueMicrotask(() => this.readyCb?.());
    return () => {
      this.bc?.removeEventListener("message", fn);
    };
  }

  /**
   * Registers a callback fired once the transport has finished
   * subscribing. For `BroadcastChannel` this is essentially immediate
   * (next microtask).
   *
   * @param cb Callback invoked once when the channel is ready.
   */
  onReady(cb: () => void) {
    this.readyCb = cb;
  }

  /** Closes the underlying `BroadcastChannel`. Safe to call repeatedly. */
  close() {
    this.bc?.close();
    this.bc = null;
  }
}
