"use client";

/**
 * @file `SlidePreview` — renders a slide at a fixed virtual viewport
 * and scales it to fit its container, preserving aspect ratio.
 */

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";

/** Default virtual stage width in CSS pixels (16:10 aspect with `STAGE_H`). */
const STAGE_W = 1440;
/** Default virtual stage height in CSS pixels. */
const STAGE_H = 900;

/**
 * Props for {@link SlidePreview}.
 */
export type SlidePreviewProps = {
  /** Slide component to render inside the scaled stage. */
  Component: ComponentType;
  /** Extra class names appended to the wrapper element. */
  className?: string;
  /** Inline styles applied to the wrapper element. */
  style?: CSSProperties;
  /** Override the virtual stage width. Defaults to 1440. */
  stageWidth?: number;
  /** Override the virtual stage height. Defaults to 900. */
  stageHeight?: number;
};

/**
 * Renders a real slide component at a fixed virtual viewport and scales it
 * to fit the available container size (preserving aspect ratio).
 *
 * Slides are authored against a stable `stageWidth` × `stageHeight`
 * coordinate system. A `ResizeObserver` watches the wrapper element
 * and recomputes the CSS `transform: scale(...)` whenever the
 * container changes size, so the same slide looks correct in
 * fullscreen, side-by-side, or thumbnail contexts.
 *
 * @example
 * ```tsx
 * <SlidePreview Component={IntroSlide} style={{ flex: 1 }} />
 * ```
 */
export function SlidePreview({
  Component,
  className = "",
  style,
  stageWidth = STAGE_W,
  stageHeight = STAGE_H,
}: SlidePreviewProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      // Pick the smaller scale factor to ensure the stage always fits
      // entirely within the container while preserving aspect ratio.
      const s = Math.min(width / stageWidth, height / stageHeight);
      setScale(s);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageWidth, stageHeight]);

  return (
    <div ref={boxRef} className={`sk-slide-preview ${className}`} style={style}>
      <div
        className="sk-slide-preview__stage"
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          transform: `scale(${scale})`,
        }}
      >
        <Component />
      </div>
    </div>
  );
}
