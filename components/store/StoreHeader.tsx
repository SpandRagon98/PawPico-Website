import Image from "next/image";
import { sitePath } from "../../lib/site-path";

export function StoreHeader() {
  return (
    <header className="store-nav">
      <a className="store-brand" href={sitePath("/")} aria-label="MewMuze home">
        <span>
          <Image
            src={sitePath("/cat/mewmuze-face-logo-hd.png")}
            alt=""
            width={512}
            height={512}
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
