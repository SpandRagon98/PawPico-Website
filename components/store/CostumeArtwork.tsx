import Image from "next/image";
import type { CSSProperties } from "react";
import type { StoreConcept } from "../../data/store/catalog";
import { sitePath } from "../../lib/site-path";

export function CostumeArtwork({
  concept,
  size = "card",
  label,
}: {
  concept: StoreConcept;
  size?: "card" | "hero" | "detail";
  label?: string;
}) {
  return (
    <div
      className={`concept-art concept-art-${size}`}
      style={{
        "--concept-a": concept.palette[0],
        "--concept-b": concept.palette[1],
        "--concept-c": concept.palette[2],
      } as CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <span className={`concept-shape concept-${concept.visual}`} aria-hidden="true">
        <i>{concept.glyph}</i>
      </span>
      <Image
        className="concept-cat"
        src={sitePath("/cat/mewmuze-hero-reference-hd.png")}
        alt=""
        aria-hidden="true"
        width={768}
        height={768}
        unoptimized
        priority={size === "hero"}
      />
      <span className="concept-grid" aria-hidden="true" />
      <small aria-hidden="true">ORIGINAL CONCEPT / {concept.stage.toUpperCase()}</small>
    </div>
  );
}
