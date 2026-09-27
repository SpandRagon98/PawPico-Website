"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type GlassComponent = typeof import("liquid-glass-react").default;
type GlassVariant = "action" | "navigation" | "panel";

/**
 * liquid-glass-react supplies the pane itself: tint, pointer-tracking rim
 * highlights and the small elastic lean. Its own refraction no longer reaches
 * the screen in current Chromium, so the bend comes from a page-level layer
 * under each pane: a backdrop-filter using a displacement map drawn for that
 * pane's exact size, strongest at the rim like thick glass.
 *
 * `radius` null means a pill (half the height); `bend` scales the rim band.
 */
const glassSettings = {
  action: { radius: null, bend: 1.3, frost: 2, elasticity: 0.08 },
  navigation: { radius: null, bend: 1.2, frost: 3, elasticity: 0.045 },
  panel: { radius: 36, bend: 1.1, frost: 3, elasticity: 0 },
} as const;

/** How far in from the edge the glass bends, in px. */
const rimBand = (height: number, radius: number) => Math.min(height * 0.42, Math.max(28, radius * 1.2));

/** Inward-pointing rim displacement for a rounded rectangle, as a data URL. */
function rimMap(width: number, height: number, radius: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const image = context.createImageData(width, height);
  const band = rimBand(height, radius);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // Nearest point of the straight "core" rectangle; outside it we are in a
      // rounded corner (or a pill's end), inside it the nearest edge is straight.
      const vx = px - Math.min(Math.max(px, radius), width - radius);
      const vy = py - Math.min(Math.max(py, radius), height - radius);
      const corner = Math.hypot(vx, vy);
      let depth: number;
      let nx: number;
      let ny: number;
      if (corner > 0) {
        depth = radius - corner;
        nx = vx / corner;
        ny = vy / corner;
      } else {
        const edges = [px, width - px, py, height - py];
        depth = Math.min(...edges);
        const side = edges.indexOf(depth);
        nx = side === 0 ? -1 : side === 1 ? 1 : 0;
        ny = side === 2 ? -1 : side === 3 ? 1 : 0;
      }
      const edge = Math.max(0, 1 - depth / band);
      const strength = edge * edge * 127;
      const i = (y * width + x) * 4;
      image.data[i] = 128 - nx * strength;
      image.data[i + 1] = 128 - ny * strength;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/** Does `el` stay put on screen while the page scrolls (fixed, or inside a sticky/fixed box)? */
function pinnedToViewport(el: HTMLElement): boolean {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "fixed" || position === "sticky") return true;
  }
  return false;
}

/** The package reads navigator while rendering, so it must load after hydration. */
export function GlassSurface({
  children,
  className = "",
  variant = "action",
  fit = false,
}: {
  children?: ReactNode;
  className?: string;
  variant?: GlassVariant;
  /** Size the pane to its content instead of to CSS (the pane itself is absolute). */
  fit?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterId = `glass-bend-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [LiquidGlass, setLiquidGlass] = useState<GlassComponent | null>(null);
  const [still, setStill] = useState(false);
  const [fitWidth, setFitWidth] = useState<number | null>(null);
  const [map, setMap] = useState<{ width: number; height: number; left: number; top: number; fixed: boolean; url: string } | null>(null);
  const settings = glassSettings[variant];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsBackdrop =
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");
    // Refraction itself is not motion, so the navigation and panels keep their
    // glass for reduced-motion visitors and only lose the elastic pointer lean.
    if (!supportsBackdrop || (reducedMotion && variant === "action")) return;

    let mounted = true;
    void import("liquid-glass-react")
      .then((module) => {
        if (!mounted) return;
        setStill(reducedMotion);
        setLiquidGlass(() => module.default);
      })
      .catch(() => {
        // The readable, keyboard-accessible fallback remains in place.
      });
    return () => { mounted = false; };
  }, [variant]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!fit || !wrapper) return;
    let frame = 0;
    const measure = () => {
      const content = wrapper.querySelector<HTMLElement>(".glass-surface-content");
      const width = content ? Math.ceil(content.getBoundingClientRect().width) : 0;
      if (width) setFitWidth((previous) => (previous === width ? previous : width));
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    const content = wrapper.querySelector(".glass-surface-content");
    if (content) observer.observe(content);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [fit, LiquidGlass]);

  // liquid-glass-react measures itself only on mount and on window resize.
  useEffect(() => {
    if (fit && LiquidGlass && fitWidth) window.dispatchEvent(new Event("resize"));
  }, [fit, LiquidGlass, fitWidth]);

  // Track the pane's size (for its rim map) and page position (for the layer).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      // Decided from the live layout, not the variant: the nav's links island is
      // fixed on desktop while its brand island scrolls away with the page.
      const fixed = pinnedToViewport(wrapper);
      const rect = wrapper.getBoundingClientRect();
      const width = Math.round(wrapper.offsetWidth);
      const height = Math.round(wrapper.offsetHeight);
      if (!width || !height) return;
      const left = rect.left + (fixed ? 0 : window.scrollX);
      const top = rect.top + (fixed ? 0 : window.scrollY);
      setMap((previous) => {
        if (previous && previous.width === width && previous.height === height && previous.left === left && previous.top === top && previous.fixed === fixed) {
          return previous;
        }
        const url = previous && previous.width === width && previous.height === height ? previous.url : rimMap(width, height, glassSettings[variant].radius ?? height / 2);
        return { width, height, left, top, fixed, url };
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    // Content above the pane (images, fonts, lazy sections) can shift it down.
    observer.observe(document.body);
    window.addEventListener("resize", update);
    // Entrance animations and web fonts can still move the pane after mount.
    const late = [400, 1500, 3000].map((delay) => window.setTimeout(update, delay));
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      late.forEach(window.clearTimeout);
    };
  }, [variant]);

  const content = fit ? <div className="glass-surface-content">{children}</div> : children;
  const radius = map ? settings.radius ?? map.height / 2 : 0;
  const scale = map ? Math.round(rimBand(map.height, radius) * settings.bend) : 0;

  // Rendered at page level: Chromium drops SVG backdrop filters on elements
  // nested inside the sticky header or the hero, but not in the root layer.
  // Never place one of these over a playing video: the SVG backdrop filter
  // re-runs on every changed frame behind the pane (measured 15fps vs 56).
  const bend = map
    ? createPortal(
        <>
          <svg className="glass-bend-defs" width="0" height="0" aria-hidden="true">
            <filter
              id={filterId}
              x="0"
              y="0"
              width={map.width}
              height={map.height}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage href={map.url} x="0" y="0" width={map.width} height={map.height} result="map" />
              {/* Red, green and blue bend by slightly different amounts: a faint prism fringe at the rim. */}
              <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="bentR" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 1.04} xChannelSelector="R" yChannelSelector="G" result="bentG" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 1.08} xChannelSelector="R" yChannelSelector="G" result="bentB" />
              <feColorMatrix in="bentR" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              <feColorMatrix in="bentG" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
              <feColorMatrix in="bentB" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg" />
              <feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" />
            </filter>
          </svg>
          <span
            className={`glass-bend glass-bend--${variant}`}
            aria-hidden="true"
            style={{
              position: map.fixed ? "fixed" : "absolute",
              left: map.left,
              top: map.top,
              width: map.width,
              height: map.height,
              borderRadius: radius,
              backdropFilter: `url(#${filterId}) blur(${settings.frost}px) saturate(160%)`,
            }}
          />
        </>,
        document.body,
      )
    : null;

  return (
    <div
      ref={wrapperRef}
      className={`glass-surface glass-surface--${variant} ${className}`.trim()}
      data-glass={LiquidGlass ? "refracted" : "fallback"}
      style={fit && fitWidth ? { width: fitWidth } : undefined}
    >
      {bend}
      {LiquidGlass ? (
        <LiquidGlass
          className="glass-surface-package"
          mode="polar"
          displacementScale={0}
          blurAmount={0}
          saturation={100}
          aberrationIntensity={0}
          elasticity={still ? 0 : settings.elasticity}
          cornerRadius={settings.radius ?? 999}
          padding="0px"
          style={{ position: "absolute", top: "50%", left: "50%", width: "100%", height: "100%" }}
        >
          {content}
        </LiquidGlass>
      ) : (
        <div className="glass-surface-fallback">{content}</div>
      )}
    </div>
  );
}
