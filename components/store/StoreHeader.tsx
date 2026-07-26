import Image from "next/image";
import { sitePath } from "../../lib/site-path";

export function StoreHeader() {
  return (
    <header className="store-nav">
      <a className="store-brand" href={sitePath("/")} aria-label="MewMuze home">
        <span>
          <Image
            src={sitePath("/mewmuze-flower-cat.png")}
            alt=""
            width={55}
            height={86}
            unoptimized
          />
        </span>
        <span>
          <strong>MewMuze</strong>
          <small>the wardrobe</small>
        </span>
      </a>
      <nav aria-label="Store navigation">
        <a href={sitePath("/")}>Story</a>
        <a href="#catalog">Concepts</a>
        <a href="#how-it-works">What happens next</a>
      </nav>
      <span className="store-status">Coming Soon</span>
    </header>
  );
}
