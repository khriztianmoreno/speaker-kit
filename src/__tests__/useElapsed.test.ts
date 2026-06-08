import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useElapsed } from "../hooks/useElapsed";

describe("useElapsed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 when startedAt is null", () => {
    const { result } = renderHook(() => useElapsed(null));
    expect(result.current).toBe(0);
  });

  it("returns elapsed ms since startedAt on initial render", () => {
    const startedAt = Date.now();
    vi.advanceTimersByTime(3_000);
    const { result } = renderHook(() => useElapsed(startedAt));
    expect(result.current).toBeGreaterThanOrEqual(3_000);
  });

  it("increases after each tick interval", () => {
    const startedAt = Date.now();
    const { result } = renderHook(() => useElapsed(startedAt));
    const before = result.current;
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current).toBeGreaterThan(before);
  });

  it("returns 0 when startedAt is reset to null", () => {
    const { result, rerender } = renderHook(
      ({ s }: { s: number | null }) => useElapsed(s),
      { initialProps: { s: Date.now() as number | null } },
    );
    rerender({ s: null });
    expect(result.current).toBe(0);
  });

  it("clears the interval when startedAt becomes null", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { rerender } = renderHook(
      ({ s }: { s: number | null }) => useElapsed(s),
      { initialProps: { s: Date.now() as number | null } },
    );
    rerender({ s: null });
    expect(clearSpy).toHaveBeenCalled();
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useElapsed(Date.now()));
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
