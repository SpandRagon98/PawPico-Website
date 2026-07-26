export type ConceptStage = "Sketching" | "Silhouette study" | "Palette study";

export interface StoreConcept {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  stage: ConceptStage;
  visual: string;
  glyph: string;
  palette: [string, string, string];
  conceptNotes: string[];
}

export const storeCatalog: StoreConcept[] = [
  {
    slug: "mecha-hero",
    name: "Mecha Hero",
    description: "Rounded rescue armor with a warm reactor light and room for whiskers.",
    longDescription:
      "An original friendly machine-hero study built around broad ceramic plates, a soft mint light and an open cat face.",
    category: "Hero systems",
    stage: "Silhouette study",
    visual: "mecha",
    glyph: "M",
    palette: ["#d88472", "#f1d48c", "#9ed8ca"],
    conceptNotes: ["Open-face helmet", "Rounded rescue plates", "Soft mint status lights"],
  },
  {
    slug: "shield-guardian",
    name: "Shield Guardian",
    description: "A small field jacket and rounded shield for brave desktop patrols.",
    longDescription:
      "A calm guardian concept with a powder-blue jacket, cream collar and simple original shield geometry.",
    category: "Hero systems",
    stage: "Palette study",
    visual: "guardian",
    glyph: "G",
    palette: ["#8fb9d7", "#f1e4c4", "#c9877a"],
    conceptNotes: ["Powder-blue jacket", "Round shield", "Soft silver fastenings"],
  },
  {
    slug: "web-scout",
    name: "Web Scout",
    description: "A plum rooftop scout suit mapped with fine silver climbing lines.",
    longDescription:
      "An entirely original agile-scout outfit using abstract route lines, soft paw wraps and no third-party marks.",
    category: "Explorers",
    stage: "Sketching",
    visual: "scout",
    glyph: "W",
    palette: ["#70556f", "#d9d7df", "#d49384"],
    conceptNotes: ["Abstract route stitching", "Soft climbing wraps", "Flexible tail panel"],
  },
  {
    slug: "shadow-ninja",
    name: "Shadow Ninja",
    description: "Ink-soft wraps and a lavender sash for silent window-to-window missions.",
    longDescription:
      "A restrained original stealth outfit focused on simple folded cloth, readable pixel silhouettes and gentle violet accents.",
    category: "Explorers",
    stage: "Silhouette study",
    visual: "shadow",
    glyph: "S",
    palette: ["#3e4148", "#8f82a8", "#c8b9b0"],
    conceptNotes: ["Folded hood", "Lavender sash", "Quiet paw wraps"],
  },
  {
    slug: "winter-star",
    name: "Winter Star",
    description: "A snow-soft coat with a pale yellow star clasp.",
    longDescription:
      "A warm seasonal concept built from original quilted shapes, cream trim and a small star-shaped fastening.",
    category: "Seasonal",
    stage: "Palette study",
    visual: "winter",
    glyph: "✦",
    palette: ["#a9c7df", "#fff4df", "#efd887"],
    conceptNotes: ["Quilted coat", "Cream hood trim", "Original star clasp"],
  },
  {
    slug: "cosmic-explorer",
    name: "Cosmic Explorer",
    description: "A sea-glass flight suit for local-orbit naps.",
    longDescription:
      "An original retro-space study with a round collar, tiny generic mission patch and soft peach control lights.",
    category: "Space",
    stage: "Silhouette study",
    visual: "cosmic",
    glyph: "C",
    palette: ["#75aead", "#e7e2d5", "#e6a27c"],
    conceptNotes: ["Round flight collar", "Original mission patch", "Peach status lamps"],
  },
  {
    slug: "moon-mage",
    name: "Moon Mage",
    description: "A midnight robe scattered with quiet moons.",
    longDescription:
      "An original fantasy robe with a crescent clasp, a lavender lining and a soft star-speckled hem.",
    category: "Fantasy",
    stage: "Palette study",
    visual: "mage",
    glyph: "☾",
    palette: ["#535379", "#e8d88f", "#bcb5dd"],
    conceptNotes: ["Crescent clasp", "Lavender lining", "Star-speckled hem"],
  },
  {
    slug: "pixel-knight",
    name: "Pixel Knight",
    description: "Rounded silver armor for very serious mouse patrols.",
    longDescription:
      "An original pocket-sized knight study with friendly armor proportions, a peach pennant and no sharp edges.",
    category: "Fantasy",
    stage: "Sketching",
    visual: "knight",
    glyph: "K",
    palette: ["#9ca8aa", "#dc987d", "#f0dda9"],
    conceptNotes: ["Rounded plates", "Peach pennant", "Open whisker guard"],
  },
  {
    slug: "cozy-barista",
    name: "Cozy Barista",
    description: "A cinnamon apron for the smallest café shift.",
    longDescription:
      "A gentle café concept with a stitched pocket, rolled neckerchief and a warm, original everyday palette.",
    category: "Cozy",
    stage: "Silhouette study",
    visual: "barista",
    glyph: "B",
    palette: ["#b37a59", "#ead9b8", "#8bad8d"],
    conceptNotes: ["Cinnamon apron", "Stitched pocket", "Cream neckerchief"],
  },
  {
    slug: "royal-wanderer",
    name: "Royal Wanderer",
    description: "A soft travelling mantle with a tiny enamel crown pin.",
    longDescription:
      "An original storybook traveller concept combining a dusty-pink mantle, practical satchel and small crown-shaped pin.",
    category: "Storybook",
    stage: "Sketching",
    visual: "royal",
    glyph: "R",
    palette: ["#c98ca0", "#f0dfb8", "#8c86b1"],
    conceptNotes: ["Travelling mantle", "Tiny satchel", "Original enamel pin"],
  },
];

export function productBySlug(slug: string): StoreConcept | undefined {
  return storeCatalog.find((concept) => concept.slug === slug);
}
