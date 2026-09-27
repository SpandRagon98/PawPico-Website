"use client";

import { useEffect, useRef, useState } from "react";
import { sitePath } from "../../lib/site-path";

/**
 * How a costume gets onto the cat, as a film of the app's own Looks panel.
 *
 * The four steps match the real flow in the desktop app: the Looks panel, the
 * Install Outfit picker, the signed package dialog and wearing the result. The
 * film only plays while it is on screen.
 */
const steps = [
  { label: "01", title: "Open Looks", line: "Settings, then Cat and Looks. Every outfit you own is on one page." },
  { label: "02", title: "Install Outfit", line: "Pick a .mewcostume file. Nothing downloads on its own and nothing installs quietly." },
  { label: "03", title: "Check what it is", line: "She shows you the creator, the version, the size and where it came from before anything happens." },
  { label: "04", title: "Wear it", line: "She changes on the spot. Swap the colour, or remove the look whenever you like." },
];

export function CostumeInstallGuide() {
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
    <section className="install-guide" id="installing" aria-labelledby="install-guide-title">
      <div className="store-section-heading">
        <div>
          <p className="store-eyebrow">
            <span aria-hidden="true" />
            GETTING A LOOK ONTO HER
          </p>
          <h2 id="install-guide-title">
            Four taps.
            <br />
            <em>No launcher, no account.</em>
          </h2>
        </div>
        <p>
          Costumes install from a single file you choose yourself. She tells you exactly what is in
          it first, and a costume can only ever be artwork.
        </p>
      </div>

      <div className="install-guide-body">
        <div className="install-guide-film">
          <video
            ref={videoRef}
            src={sitePath("/videos/mewmuze-costume-install.mp4")}
            poster={sitePath("/videos/mewmuze-costume-install-poster.webp")}
            muted
            playsInline
            loop
            preload="none"
            aria-label="Installing a costume from the MewMuze Looks panel"
          />
        </div>

        <ol className="install-guide-steps">
          {steps.map((step) => (
            <li key={step.label}>
              <span aria-hidden="true">{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="install-guide-note">
        A costume is signed visual assets and nothing else. It cannot run code, reach the internet or
        change how MewMuze behaves.
      </p>
    </section>
  );
}
