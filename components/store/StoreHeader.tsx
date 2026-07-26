import Image from "next/image";
import { sitePath } from "../../lib/site-path";

export function StoreHeader() {
  return (
    <header className="site-header store-header">
      <a className="brand" href={sitePath("/")} aria-label="MewMuze home">
        <span className="brand-lockup">
          <span className="brand-medallion">
            <Image src={sitePath("/pawpico-face-logo.png")} alt="" width={50} height={50} unoptimized />
          </span>
          <span><strong>MewMuze</strong><small>COSTUME STORE</small></span>
        </span>
      </a>
      <nav aria-label="Store navigation">
        <a href={sitePath("/")}>Home</a>
        <a href="#catalog">Costumes</a>
        <a href="#library">Library</a>
        <a href="#install">Installation</a>
      </nav>
      <a className="metal-button compact" href={sitePath("/#download")}>Get MewMuze</a>
    </header>
  );
}
