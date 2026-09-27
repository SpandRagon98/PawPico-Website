"use client";

import { useEffect, useRef, useState } from "react";
import { sitePath } from "../../lib/site-path";

/**
 * The wardrobe hero: the three built-in costumes playing full screen under a
 * sheet of glass, with one way in.
 *
 * The film is the StoreHeroCat composition in the motion-graphics project: the
 * cat keyed off her white studio plate and placed on the homepage's own hero
 * gradient, so the store and the landing page share one sky. She sits on the
 * right of the frame; the copy takes the left. The section repeats the same
 * gradient in CSS so the film has nothing to butt against.
 *
 * It only plays while the hero is on screen.
 */
export function StoreVideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <section className="store-video-hero">
      <div className="store-video-hero-copy">
        <p className="store-eyebrow">
          <span aria-hidden="true" />
          THE MEWMUZE WARDROBE
        </p>
        <h1>Welcome to the cat shop.</h1>
        <p className="store-video-hero-sub">
          Three fits. Zero humility. She wears them while you work.
        </p>
        <a className="store-button store-button-primary store-video-hero-cta" href="#catalog">
          Explore now <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="store-video-hero-stage">
        <video
          ref={videoRef}
          className="store-video-hero-film"
          src={sitePath("/videos/mewmuze-store-hero.mp4")}
          poster={sitePath("/videos/mewmuze-store-hero-poster.webp")}
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
