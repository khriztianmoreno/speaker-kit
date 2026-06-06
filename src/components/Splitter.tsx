"use client";

/**
 * @file Resizable splitter primitives. Exposes `VSplitter` (vertical
 * separator that resizes horizontally) and `HSplitter` (horizontal
 * separator that resizes vertically).
 */

import { useEffect, useRef, type MouseEvent } from "react";

/**
 * Props shared by both splitter components.
 */
type SplitterProps = {
  /**
   * Called continuously while the user drags the splitter.
   *
   * @param delta Mouse delta in CSS pixels since the previous event.
   *   Positive values mean "moved right" (for `VSplitter`) or
   *   "moved down" (for `HSplitter`).
   */
  onResize: (delta: number) => void;
};

/**
 * Internal hook that wires up mousedown/mousemove/mouseup listeners
 * to drive a drag interaction along a single axis.
 *
 * The latest `onResize` reference is kept in a ref so the global
 * listeners can call the freshest callback without re-binding.
 *
 * @param axis    Which mouse axis the drag tracks (`"x"` or `"y"`).
 * @param cursor  CSS cursor applied to `document.body` while dragging.
 * @param onResize Callback invoked with each delta during drag.
 * @returns A `mousedown` handler to attach to the splitter element.
 */
function useDrag(
  axis: "x" | "y",
  cursor: "col-resize" | "row-resize",
  onResize: (delta: number) => void,
) {
  const draggingRef = useRef(false);
  const lastRef = useRef(0);
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const onMouseDown = (e: MouseEvent) => {
    draggingRef.current = true;
    lastRef.current = axis === "x" ? e.clientX : e.clientY;
    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      if (!draggingRef.current) return;
      const cur = axis === "x" ? e.clientX : e.clientY;
      const delta = cur - lastRef.current;
      lastRef.current = cur;
      onResizeRef.current(delta);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [axis]);

  return onMouseDown;
}

/**
 * Vertical separator bar between two side-by-side panes.
 *
 * Drag the bar horizontally to fire `onResize(deltaX)`.
 */
export function VSplitter({ onResize }: SplitterProps) {
  const onMouseDown = useDrag("x", "col-resize", onResize);
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onMouseDown={onMouseDown}
      className="sk-splitter sk-splitter--v"
      title="Drag to resize"
    >
      <div className="sk-splitter__bar" />
    </div>
  );
}

/**
 * Horizontal separator bar between two stacked panes.
 *
 * Drag the bar vertically to fire `onResize(deltaY)`.
 */
export function HSplitter({ onResize }: SplitterProps) {
  const onMouseDown = useDrag("y", "row-resize", onResize);
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      onMouseDown={onMouseDown}
      className="sk-splitter sk-splitter--h"
      title="Drag to resize"
    >
      <div className="sk-splitter__bar" />
    </div>
  );
}
