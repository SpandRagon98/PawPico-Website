"use client";

import Image from "next/image";
import { GlassSurface } from "../app/GlassSurface";
import { sitePath } from "../lib/site-path";
import { useAuth } from "./AuthProvider";

/**
 * The site's navigation: three liquid-glass islands, shared by the homepage and
 * the store so every page wears the same bar.
 *
 * `base` prefixes the in-page anchors. The homepage passes nothing and links to
 * its own sections; the store passes "/" so the same links lead home.
 */

const FACE_LOGO_ASSET = "/cat/mewmuze-face-logo-hd.png";

/**
 * Log in / Sign up, or who you are signed in as. Always present.
 *
 * It is its own liquid-glass island, the same pane the links and the brand sit
 * in, so the three read as one bar rather than a bar with a plain button
 * bolted to the end.
 */
function AccountControl() {
  const { state, requestSignIn, logOut } = useAuth();
  const user = state.status === "ready" ? state.account.user : null;

  return (
    <GlassSurface className="nav-glass nav-glass-account" variant="navigation" fit>
      {user ? (
        <span className="nav-account">
          <span className="nav-account-name" title={user.email}>
            {user.name || user.email}
          </span>
          <button className="nav-account-button" type="button" onClick={() => void logOut()}>
            Log out
          </button>
        </span>
      ) : (
        <span className="nav-account">
          <button className="nav-account-button" type="button" onClick={() => requestSignIn()}>
            Log in / Sign up
          </button>
        </span>
      )}
    </GlassSurface>
  );
}

export function SiteBrand() {
  return (
    <span className="site-brand">
      <span className="brand-medallion">
        <Image src={sitePath(FACE_LOGO_ASSET)} alt="" width={512} height={512} unoptimized />
      </span>
      <span>
        <strong>MewMuze</strong>
        <small>personal desktop pet</small>
      </span>
    </span>
  );
}

/** The same control as AccountControl, shaped like a drawer link. */
function MobileAccountLink() {
  const { state, requestSignIn, logOut } = useAuth();
  const user = state.status === "ready" ? state.account.user : null;

  return (
    <button className="mobile-nav-account" type="button" onClick={() => (user ? void logOut() : requestSignIn())}>
      {user ? `Log out (${user.name || user.email})` : "Log in / Sign up"}
    </button>
  );
}

export function SiteNav({ base = "" }: { base?: string }) {
  const home = base || sitePath("/");
  const links = (
    <>
      <a href={`${base}#companion`}>Companion</a>
      <a href={`${base}#feelings`}>Feelings</a>
      <a href={`${base}#quick-tools`}>Work Mode</a>
      <a href={`${base}#costumes`}>Looks</a>
      <a href={`${base}#directory`}>Features</a>
      <a href={sitePath("/store/")}>
        Store
      </a>
      <a href={`${base}#pricing`}>Download</a>
    </>
  );

  // Separate liquid-glass islands rather than one bar: Chromium stops feeding the
  // backdrop into an SVG-filtered pane once it is roughly 1,100px or wider, so a
  // full-width bar lost its refraction and turned grey. Each island stays well
  // inside that limit and refracts what is behind it.
  return (
    <div className="nav-dock nav-dock-islands">
      <GlassSurface className="nav-glass nav-glass-brand" variant="navigation" fit>
        <a className="brand-link" href={base ? home : "#top"} aria-label="MewMuze home">
          <SiteBrand />
        </a>
      </GlassSurface>
      <GlassSurface className="nav-glass nav-glass-links" variant="navigation" fit>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links}
        </nav>
      </GlassSurface>
      <details className="mobile-nav" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) event.currentTarget.open = false;
      }} onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}>
        <summary aria-label="Open navigation">Menu</summary>
        <nav aria-label="Mobile navigation">
          {links}
          <a href={sitePath("/support/")}>Support</a>
          {/* The desktop account control is hidden on phones, so the drawer
              carries it instead: the account is needed to download. */}
          <MobileAccountLink />
        </nav>
      </details>
      <div className="nav-auth">
        <AccountControl />
        <GlassSurface className="nav-glass nav-glass-account" variant="navigation" fit>
          <span className="nav-account">
            <a className="nav-account-button nav-account-button-live" href={`${base}#paper-preview`}>
              Live demo
            </a>
          </span>
        </GlassSurface>
      </div>
    </div>
  );
}
