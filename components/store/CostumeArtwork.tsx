import Image from "next/image";
import { sitePath } from "../../lib/site-path";
import type { StoreProduct } from "../../data/store/catalog";

export function CostumeArtwork({
  product,
  size = "card",
  label,
}: {
  product: StoreProduct;
  size?: "card" | "hero" | "detail";
  label?: string;
}) {
  return (
    <div
      className={`costume-art costume-art-${size}`}
      style={{
        "--costume-a": product.palette[0],
        "--costume-b": product.palette[1],
        "--costume-c": product.palette[2],
      } as React.CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <span className="costume-halo" aria-hidden="true" />
      {product.artworkPath ? (
        <Image
          className="costume-product-image"
          src={sitePath(product.artworkPath)}
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          unoptimized
          priority={size === "hero"}
        />
      ) : (
        <>
          <Image
            src={sitePath("/pawpico-cat-idle.png")}
            alt=""
            aria-hidden="true"
            width={420}
            height={420}
            unoptimized
            priority={size === "hero"}
          />
          <span className={`costume-shell costume-${product.visual}`} aria-hidden="true">
            <i>{product.glyph}</i>
          </span>
        </>
      )}
      <small aria-hidden="true">{product.name}</small>
    </div>
  );
}
