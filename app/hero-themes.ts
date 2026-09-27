import type { Rgb } from "./HeroCatCanvas";

/**
 * Hero jacket colours. `jacket` is the sRGB colour (0 to 1) the film's jacket is
 * dyed to; the matching background palette lives in hero-neon.css under the same
 * data-hero-theme id, so the two always change together.
 */
export const heroThemes = [
  { id: "green", label: "Neon green", swatch: "#6dff2e", jacket: [0.43, 1, 0.18] },
  { id: "pink", label: "Hot pink", swatch: "#ff3fa0", jacket: [1, 0.25, 0.63] },
  { id: "blue", label: "Electric blue", swatch: "#2e8fff", jacket: [0.18, 0.56, 1] },
  { id: "purple", label: "Violet", swatch: "#9a5cff", jacket: [0.6, 0.36, 1] },
  { id: "red", label: "Signal red", swatch: "#ff3b30", jacket: [1, 0.23, 0.19] },
] as const satisfies ReadonlyArray<{ id: string; label: string; swatch: string; jacket: Rgb }>;

export type HeroThemeId = (typeof heroThemes)[number]["id"];
