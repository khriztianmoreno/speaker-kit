import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BroadcastChannelTransport } from "../transports/broadcast-channel";
import type { NavMsg } from "../types";

// Minimal BroadcastChannel mock that properly routes messages between
// instances on the same channel (the native API does this cross-tab).
class MockBroadcastChannel {
  static registry = new Map<string, Set<MockBroadcastChannel>>();

  private handlers: Array<(ev: MessageEvent) => void> = [];
  private closed = false;

  constructor(private name: string) {
    const group =
      MockBroadcastChannel.registry.get(name) ?? new Set<MockBroadcastChannel>();
    group.add(this);
    MockBroadcastChannel.registry.set(name, group);
  }

  postMessage(data: unknown) {
    if (this.closed) return;
    MockBroadcastChannel.registry.get(this.name)?.forEach((peer) => {
      if (peer !== this && !peer.closed) {
        peer.handlers.forEach((fn) =>
          fn(new MessageEvent("message", { data })),
        );
      }
    });
  }

  addEventListener(_type: string, fn: (ev: MessageEvent) => void) {
    this.handlers.push(fn);
  }

  removeEventListener(_type: string, fn: (ev: MessageEvent) => void) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }

  close() {
    this.closed = true;
    MockBroadcastChannel.registry.get(this.name)?.delete(this);
  }
}

const NAV_MSG: NavMsg = {
  type: "navigate",
  index: 2,
  senderId: "sender-1",
  ts: 0,
};

describe("BroadcastChannelTransport", () => {
  beforeEach(() => {
    MockBroadcastChannel.registry.clear();
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delivers a sent message to subscribers on the same channel", () => {
    const sender = new BroadcastChannelTransport("ch");
    const receiver = new BroadcastChannelTransport("ch");
    const received: unknown[] = [];
    receiver.subscribe((msg) => received.push(msg));
    sender.send(NAV_MSG);
    expect(received).toEqual([NAV_MSG]);
  });

  it("does not deliver a message to the sender itself", () => {
    const transport = new BroadcastChannelTransport("ch");
    const received: unknown[] = [];
    transport.subscribe((msg) => received.push(msg));
    transport.send(NAV_MSG);
    expect(received).toHaveLength(0);
  });

  it("does not deliver to a different channel", () => {
    const sender = new BroadcastChannelTransport("ch-a");
    const receiver = new BroadcastChannelTransport("ch-b");
    const received: unknown[] = [];
    receiver.subscribe((msg) => received.push(msg));
    sender.send(NAV_MSG);
    expect(received).toHaveLength(0);
  });

  it("unsubscribe stops receiving messages", () => {
    const sender = new BroadcastChannelTransport("ch");
    const receiver = new BroadcastChannelTransport("ch");
    const received: unknown[] = [];
    const unsub = receiver.subscribe((msg) => received.push(msg));
    unsub();
    sender.send(NAV_MSG);
    expect(received).toHaveLength(0);
  });

  it("onReady fires after subscribe (next microtask)", async () => {
    const transport = new BroadcastChannelTransport("ch");
    const onReady = vi.fn();
    transport.onReady(onReady);
    transport.subscribe(() => {});
    await Promise.resolve();
    expect(onReady).toHaveBeenCalledOnce();
  });

  it("close() shuts down the underlying channel", () => {
    const transport = new BroadcastChannelTransport("ch");
    transport.close();
    const instance = [...MockBroadcastChannel.registry.values()]
      .flatMap((s) => [...s])
      .find(Boolean);
    // All instances were removed from registry on close
    expect(instance).toBeUndefined();
  });

  it("send() is a noop after close()", () => {
    const sender = new BroadcastChannelTransport("ch");
    const receiver = new BroadcastChannelTransport("ch");
    const received: unknown[] = [];
    receiver.subscribe((msg) => received.push(msg));
    sender.close();
    sender.send(NAV_MSG);
    expect(received).toHaveLength(0);
  });
});
