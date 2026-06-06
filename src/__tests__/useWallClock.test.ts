import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWallClock } from "../hooks/useWallClock";

describe("useWallClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a Date instance", () => {
    const { result } = renderHook(() => useWallClock());
    expect(result.current).toBeInstanceOf(Date);
  });

  it("updates every second", () => {
    const { result } = renderHook(() => useWallClock());
    const before = result.current.getTime();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.getTime()).toBeGreaterThan(before);
  });

  it("does not update before a second has elapsed", () => {
    const { result } = renderHook(() => useWallClock());
    const before = result.current.getTime();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.getTime()).toBe(before);
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useWallClock());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
