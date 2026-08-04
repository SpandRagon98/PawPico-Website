import Image from "next/image";
import { sitePath } from "../lib/site-path";

type PublicHeaderProps = {
  current?: "home" | "store" | "support";
};

const links: Array<{
  label: string;
  href: string;
  page: NonNullable<PublicHeaderProps["current"]>;
  note?: string;
}> = [
  { label: "Story", href: "/#story", page: "home" },
  { label: "Features", href: "/#features", page: "home" },
  { label: "Appearance", href: "/#appearance", page: "home" },
  { label: "Store", href: "/store/", page: "store", note: "Coming Soon" },
  { label: "FAQ", href: "/#faq", page: "home" },
  { label: "Privacy", href: "/#privacy", page: "home" },
  { label: "Support", href: "/support/", page: "support" },
];

export function PublicHeader({ current }: PublicHeaderProps) {
  const navLinks = links.map((link) => (
    <a
      key={link.label}
      href={sitePath(link.href)}
      aria-current={current === link.page ? "page" : undefined}
    >
      {link.label}
      {link.note ? <span className="coming-pill">{link.note}</span> : null}
    </a>
  ));

  return (
    <header className="site-navigation public-navigation">
      <div className="nav-dock">
        <a className="brand-link" href={sitePath("/")} aria-label="MewMuze home">
          <span className="site-brand">
            <span className="brand-medallion">
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
              <small>personal desktop cat</small>
            </span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks}
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">{navLinks}</nav>
        </details>
        <a
          className="skeuo-button skeuo-button-primary nav-cta public-nav-buy"
          href={sitePath("/#pricing")}
        >
          Buy MewMuze
        </a>
      </div>
    </header>
  );
}
