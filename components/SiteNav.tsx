"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/** "Spandan Talukdar" -> "ST", "mewmuze" (no name) -> "M". */
function initialsFor(user: { name: string; email: string }): string {
  const words = user.name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words.slice(0, 2).map((word) => word[0]!.toUpperCase()).join("");
  }
  return (user.email[0] ?? "?").toUpperCase();
}

/**
 * Log in / Sign up, or an initials avatar that opens a small profile card.
 *
 * It is its own liquid-glass island, the same pane the links and the brand sit
 * in, so the three read as one bar rather than a bar with a plain button
 * bolted to the end.
 */
function AccountControl() {
  const { state, requestSignIn, logOut } = useAuth();
  const user = state.status === "ready" ? state.account.user : null;
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // Document coordinates, so the card scrolls with the trigger instead
      // of drifting: this island is not position: fixed like the links are.
      setMenuPos({ top: rect.bottom + window.scrollY + 10, left: rect.right + window.scrollX });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Signing out closes the card instead of leaving it open on nothing.
  useEffect(() => {
    if (!user) setOpen(false);
  }, [user]);

  return (
    <GlassSurface
      className={`nav-glass nav-glass-account${user ? " nav-glass-avatar" : ""}`}
      variant="navigation"
      fit
    >
      {user ? (
        <div className="nav-profile" ref={wrapRef}>
          <button
            ref={triggerRef}
            className="nav-profile-trigger"
            type="button"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label={`Account: ${user.name || user.email}`}
          >
            <span className="nav-profile-avatar" aria-hidden="true">
              {initialsFor(user)}
            </span>
          </button>
          {open && menuPos &&
            createPortal(
              <div
                ref={menuRef}
                className="nav-profile-menu"
                role="menu"
                style={{ top: menuPos.top, left: menuPos.left }}
              >
                <p className="nav-profile-name">{user.name || "MewMuze account"}</p>
                <p className="nav-profile-email">{user.email}</p>
                <button
                  className="nav-profile-logout"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logOut();
                  }}
                >
                  Log out
                </button>
              </div>,
              document.body,
            )}
        </div>
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
