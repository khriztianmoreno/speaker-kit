import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlideSync } from "../hooks/useSlideSync";
import type { SyncMsg, Transport } from "../types";

// Minimal BroadcastChannel stub so the hook's default transport doesn't throw.
class StubBroadcastChannel {
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
  close() {}
}

function makeMockTransport() {
  const sent: SyncMsg[] = [];
  const subs: Array<(msg: SyncMsg) => void> = [];
  let readyCb: (() => void) | undefined;

  const transport: Transport = {
    send(msg) {
      sent.push(msg);
    },
    subscribe(fn) {
      subs.push(fn);
      queueMicrotask(() => readyCb?.());
      return () => {
        const i = subs.indexOf(fn);
        if (i >= 0) subs.splice(i, 1);
      };
    },
    onReady(cb) {
      readyCb = cb;
    },
    close() {
      subs.length = 0;
    },
  };

  return {
    transport,
    sent,
    /** Simulate an incoming message from a remote sender. */
    deliver(msg: SyncMsg) {
      subs.forEach((fn) => fn(msg));
    },
  };
}

describe("useSlideSync", () => {
  beforeEach(() => {
    vi.stubGlobal("BroadcastChannel", StubBroadcastChannel);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts at index 0", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    expect(result.current.index).toBe(0);
  });

  it("goTo updates the index for a speaker", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(3);
    });
    expect(result.current.index).toBe(3);
  });

  it("goNext advances by one", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goNext();
    });
    expect(result.current.index).toBe(1);
  });

  it("goPrev steps back by one", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(2);
    });
    act(() => {
      result.current.goPrev();
    });
    expect(result.current.index).toBe(1);
  });

  it("clamps goTo to [0, total - 1]", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(99);
    });
    expect(result.current.index).toBe(4);

    act(() => {
      result.current.goTo(-5);
    });
    expect(result.current.index).toBe(0);
  });

  it("goTo broadcasts a navigate message", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(2);
    });
    const navMsgs = mock.sent.filter((m) => m.type === "navigate");
    expect(navMsgs.at(-1)).toMatchObject({ type: "navigate", index: 2 });
  });

  it("audience role ignores goTo (follower-only)", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        role: "audience",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(3);
    });
    expect(result.current.index).toBe(0);
  });

  it("incoming navigate message updates the index", async () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    await act(async () => {
      mock.deliver({ type: "navigate", index: 4, senderId: "remote", ts: 0 });
    });
    expect(result.current.index).toBe(4);
  });

  it("clamps an incoming index that exceeds total", async () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    await act(async () => {
      mock.deliver({ type: "navigate", index: 99, senderId: "remote", ts: 0 });
    });
    expect(result.current.index).toBe(4);
  });

  it("ignores navigate messages from self", async () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    // Capture the senderId from the first outgoing message
    act(() => {
      result.current.goTo(1);
    });
    const senderId = (mock.sent.find((m) => m.type === "navigate") as { senderId: string })?.senderId;
    expect(senderId).toBeDefined();

    // Echo the same message back as if it came from ourselves
    await act(async () => {
      mock.deliver({ type: "navigate", index: 4, senderId, ts: 0 });
    });
    // Index should not have changed to 4
    expect(result.current.index).toBe(1);
  });

  it("speaker replies to request-state with current index", async () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        role: "speaker",
        transports: () => [mock.transport],
      }),
    );
    act(() => {
      result.current.goTo(3);
    });
    const before = mock.sent.length;
    await act(async () => {
      mock.deliver({ type: "request-state", senderId: "new-joiner" });
    });
    const reply = mock.sent.slice(before).find((m) => m.type === "navigate");
    expect(reply).toMatchObject({ type: "navigate", index: 3 });
  });

  it("audience does not send a navigate reply to request-state", async () => {
    const mock = makeMockTransport();
    renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        role: "audience",
        transports: () => [mock.transport],
      }),
    );
    // Let onReady fire and the initial request-state be sent, then snapshot
    await act(async () => {});
    const before = mock.sent.length;
    await act(async () => {
      mock.deliver({ type: "request-state", senderId: "someone" });
    });
    const navReplies = mock.sent
      .slice(before)
      .filter((m) => m.type === "navigate");
    expect(navReplies).toHaveLength(0);
  });

  it("emits request-state on mount to sync with existing speakers", async () => {
    const mock = makeMockTransport();
    renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        transports: () => [mock.transport],
      }),
    );
    await act(async () => {});
    expect(mock.sent.some((m) => m.type === "request-state")).toBe(true);
  });

  it("exposes the active role", () => {
    const mock = makeMockTransport();
    const { result } = renderHook(() =>
      useSlideSync({
        total: 5,
        channel: "test",
        role: "audience",
        transports: () => [mock.transport],
      }),
    );
    expect(result.current.role).toBe("audience");
  });
});
