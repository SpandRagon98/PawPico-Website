"use client";

import { useEffect, useRef, useState } from "react";
import { sitePath } from "../../lib/site-path";

/**
 * The three costumes the app actually ships with, each shown as its own card
 * with the film the motion-graphics project renders for it.
 *
 * These are the real wardrobe: they come with Pro, and each card offers the
 * actual signed .mewcostume package to download and install from the app's
 * Looks panel. Nothing is sold here.
 */
const costumes = [
  {
    id: "corporate",
    name: "Corporate Cat",
    file: "mewmuze.corporate-cat.v1.mewcostume",
    tag: "6 suit colours",
    line: "Per my last meow, this could have been an email.",
    what: "A tailored two-piece with a shirt collar, a knotted tie and polished shoes, cut to sit properly on a cat that is mostly fur and opinions.",
    detail:
      "Built for the working day: she looks the part through your standups, your 4pm sync and the twelfth calendar invite nobody needed.",
    moods: ["Determined", "Thinking", "Annoyed", "Savage", "Tired", "Victory"],
    colours: ["#1b2b4d", "#3b4049", "#aeb4bd", "#8db3dc", "#1c1d21", "#b3946b"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Cat",
    file: "mewmuze.cyberpunk-cat.v1.mewcostume",
    tag: "5 jacket colours",
    line: "Main character energy. Your wallpaper could never.",
    what: "An open neon puffer over a bandana, finished with a wraparound visor that catches the light as she moves.",
    detail:
      "The loudest thing on your desktop. The jacket colour drives the glow, so she reads clearly against a dark wallpaper or a bright one.",
    moods: ["Excited", "Mischievous", "Savage", "Rage", "Cheering", "Adoring"],
    colours: ["#7cf319", "#ff2fb9", "#22e0ff", "#ff7a1a", "#9d5cff"],
  },
  {
    id: "batcat",
    name: "Bat Cat",
    file: "mewmuze.bat-cat.v1.mewcostume",
    tag: "5 accent colours",
    line: "Works nights. Judges your tabs in silence.",
    what: "A pointed cowl with ear cut-outs, a cape that trails behind her walk cycle, and a chest badge that is unmistakably a cat.",
    detail:
      "Made for the late shift. The accent colour picks out the badge and the cape lining, so she stays readable at 2am on a dark screen.",
    moods: ["Suspicious", "Determined", "Angry", "Proud", "Scared", "Victory"],
    colours: ["#f2b428", "#9a5cf0", "#e0364a", "#6fd8ff", "#7cf319"],
  },
] as const;

function CostumeCard({ costume, reducedMotion }: { costume: (typeof costumes)[number]; reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "120px" },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <article className={`wardrobe-card wardrobe-card-${costume.id}`}>
      <div className="wardrobe-card-film">
        <video
          ref={videoRef}
          src={sitePath(`/videos/costume-${costume.id}.mp4`)}
          poster={sitePath(`/videos/costume-${costume.id}-poster.webp`)}
          muted
          playsInline
          loop
          preload="none"
          aria-label={`MewMuze wearing ${costume.name}`}
        />
      </div>
      <div className="wardrobe-card-body">
        <div className="wardrobe-card-title">
          <h3>{costume.name}</h3>
          <small>{costume.tag}</small>
        </div>
        <blockquote>{costume.line}</blockquote>
        <p>{costume.what}</p>
        <p className="wardrobe-card-detail">{costume.detail}</p>
        <div className="wardrobe-card-meta">
          <small>FEELINGS IN THE CLIP</small>
          <ul aria-label="Feelings in the clip">
            {costume.moods.map((mood) => (
              <li key={mood}>{mood}</li>
            ))}
          </ul>
        </div>
        <div className="wardrobe-card-meta">
          <small>{costume.tag.toUpperCase()}</small>
          <div className="wardrobe-card-swatches" aria-label={costume.tag}>
            {costume.colours.map((hex) => (
              <span key={hex} style={{ background: hex }} />
            ))}
          </div>
        </div>

        {/* The real .mewcostume package. Open it with Install Outfit in the
            app's Looks panel; the walkthrough below shows the whole flow. */}
        <a
          className="store-button store-button-primary wardrobe-card-get"
          href={sitePath(`/costumes/${costume.file}`)}
          download
        >
          Download costume <span aria-hidden="true">↓</span>
        </a>
      </div>
    </article>
  );
}

export function CostumeShowcase() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <section className="wardrobe-catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="store-section-heading">
        <div>
          <p className="store-eyebrow">
            <span aria-hidden="true" />
            IN THE WARDROBE NOW
          </p>
          <h2 id="catalog-title">
            Three costumes.
            <br />
            <em>All included with Pro.</em>
          </h2>
        </div>
        <p>
          Each one is drawn live on her body rather than pasted on top, so it moves with every pose and
          expression. Pick a fit in Settings, pick a colour, and she wears it until you change your mind.
        </p>
      </div>

      <div className="wardrobe-cards">
        {costumes.map((costume) => (
          <CostumeCard key={costume.id} costume={costume} reducedMotion={reducedMotion} />
        ))}
      </div>

      <p className="wardrobe-note">
        Costumes come with MewMuze Pro and nothing is sold on this page. Each download is a signed
        .mewcostume package: open it with Install Outfit in the app. Some expressions in the clips
        come from the Paper emotion engine preview.
      </p>
    </section>
  );
}
