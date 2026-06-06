import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useLayoutPersistence,
  DEFAULT_LAYOUT,
} from "../hooks/useLayoutPersistence";

const KEY = "test:speaker-kit:layout";

describe("useLayoutPersistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns DEFAULT_LAYOUT on the initial render", () => {
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });

  it("loads a stored layout from localStorage after mount", async () => {
    const stored = { notesWidth: 400, upcomingHeight: 150 };
    localStorage.setItem(KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    expect(result.current.layout).toEqual(stored);
  });

  it("persists layout changes to localStorage", async () => {
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    act(() => {
      result.current.setLayout({ notesWidth: 300, upcomingHeight: 100 });
    });
    const persisted = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    expect(persisted).toEqual({ notesWidth: 300, upcomingHeight: 100 });
  });

  it("reset() restores DEFAULT_LAYOUT", async () => {
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    act(() => {
      result.current.setLayout({ notesWidth: 300, upcomingHeight: 100 });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });

  it("falls back to DEFAULT_LAYOUT when localStorage contains malformed JSON", async () => {
    localStorage.setItem(KEY, "not-valid-json");
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });

  it("falls back per-field when only one field is missing", async () => {
    localStorage.setItem(KEY, JSON.stringify({ notesWidth: 400 }));
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    expect(result.current.layout.notesWidth).toBe(400);
    expect(result.current.layout.upcomingHeight).toBe(DEFAULT_LAYOUT.upcomingHeight);
  });

  it("exposes a setLayout setter", async () => {
    const { result } = renderHook(() => useLayoutPersistence(KEY));
    await act(async () => {});
    act(() => {
      result.current.setLayout((prev) => ({
        ...prev,
        notesWidth: prev.notesWidth + 50,
      }));
    });
    expect(result.current.layout.notesWidth).toBe(DEFAULT_LAYOUT.notesWidth + 50);
  });
});
