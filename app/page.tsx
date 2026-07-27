"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { featureGroups, featureStories, type FeatureStory } from "../data/features";
import { sitePath } from "../lib/site-path";

const CAT_ASSET = "/cat/mewmuze-hero-reference-hd.png";
const HERO_CAT_ASSET = "/cat/mewmuze-hero-peek-hd.png";
const HERO_CAT_BLINK_ASSET = "/cat/mewmuze-hero-peek-hd-blink.png";
const HERO_CAT_EARS_ASSET = "/cat/mewmuze-hero-peek-hd-ears.png";
const FACE_LOGO_ASSET = "/cat/mewmuze-face-logo-hd.png";

function CatFigure({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`cat-figure ${className}`} aria-hidden="true">
      <Image
        src={sitePath(CAT_ASSET)}
        alt=""
        width={768}
        height={768}
        unoptimized
        priority={priority}
      />
    </span>
  );
}

function HeroCat({
  leftPupilRef,
  rightPupilRef,
}: {
  leftPupilRef: RefObject<HTMLSpanElement | null>;
  rightPupilRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span className="hero-cat-art" aria-hidden="true">
      <Image
        className="hero-cat-layer hero-cat-base"
        src={sitePath(HERO_CAT_ASSET)}
        alt=""
        width={768}
        height={768}
        unoptimized
        priority
      />
      <span className="hero-eye-track hero-eye-track-left">
        <span ref={leftPupilRef} className="hero-pupil" />
      </span>
      <span className="hero-eye-track hero-eye-track-right">
        <span ref={rightPupilRef} className="hero-pupil" />
      </span>
      <Image
        className="hero-cat-layer hero-cat-expression hero-cat-ears"
        src={sitePath(HERO_CAT_EARS_ASSET)}
        alt=""
        width={768}
        height={768}
        unoptimized
      />
      <Image
        className="hero-cat-layer hero-cat-expression hero-cat-blink"
        src={sitePath(HERO_CAT_BLINK_ASSET)}
        alt=""
        width={768}
        height={768}
        unoptimized
      />
    </span>
  );
}

function SkeuoButton({
  href,
  children,
  variant = "primary",
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  onClick?: () => void;
  className?: string;
}) {
  const classes = `skeuo-button skeuo-button-${variant} ${className}`.trim();
  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

function SiteBrand() {
  return (
    <span className="site-brand">
      <span className="brand-medallion">
        <Image src={sitePath(FACE_LOGO_ASSET)} alt="" width={512} height={512} unoptimized />
      </span>
      <span>
        <strong>MewMuze</strong>
        <small>personal desktop cat</small>
      </span>
    </span>
  );
}

function SiteNavigation() {
  const links = (
    <>
      <a href="#story" aria-current="page">
        Story
      </a>
      <a href="#features">Features</a>
      <a href="#appearance">Appearance</a>
      <a href={sitePath("/store/")}>
        Store <span className="coming-pill">Coming Soon</span>
      </a>
      <a href="#privacy">Privacy</a>
    </>
  );

  return (
    <div className="nav-dock">
      <a className="brand-link" href="#top" aria-label="MewMuze home">
        <SiteBrand />
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links}
      </nav>
      <details className="mobile-nav">
        <summary aria-label="Open navigation">Menu</summary>
        <nav aria-label="Mobile navigation">{links}</nav>
      </details>
      <SkeuoButton href="#pricing" variant="secondary" className="nav-cta">
        View the price
      </SkeuoButton>
    </div>
  );
}

function FeatureFilm({
  feature,
  reducedMotion,
}: {
  feature: FeatureStory;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <div className="reduced-film" role="img" aria-label={`${feature.title} illustrated by MewMuze`}>
        <CatFigure className="reduced-film-cat" />
        <span>{feature.demoLabel}</span>
      </div>
    );
  }

  return (
    <Image
      key={feature.id}
      className="feature-media-cat"
      src={sitePath(`/cat/features/${feature.id}.webp`)}
      alt={`Authentic MewMuze animation for ${feature.title}`}
      width={512}
      height={512}
      unoptimized
    />
  );
}

const appearanceShowcase = [
  ["white-grey-flower", "White & grey · Flower Band · curious"],
  ["orange-happy", "Orange · happy"],
  ["calico-wave", "Calico · wave"],
  ["tuxedo-placard", "Tuxedo · placard"],
  ["tabby-groom", "Tabby · groom"],
  ["fluffy-stretch", "Fluffy · stretch"],
  ["kitten-yawn", "Kitten · yawn"],
  ["siamese-celebrate", "Siamese · celebration"],
] as const;

function AppearanceShowcase({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current);
        return (current + 1) % appearanceShowcase.length;
      });
    }, 3400);
    return () => window.clearInterval(interval);
  }, [isVisible, reducedMotion]);

  const [activeId, activeLabel] = appearanceShowcase[activeIndex];
  const previous = previousIndex === null ? null : appearanceShowcase[previousIndex];

  return (
    <div
      ref={stageRef}
      className={`appearance-showcase ${isVisible ? "is-visible" : ""}`}
      aria-label="Authentic MewMuze appearances and emotions"
    >
      <span className="showcase-window-bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div className="showcase-cat-well">
        {reducedMotion || !isVisible ? (
          <Image
            className="showcase-cat-static"
            src={sitePath(CAT_ASSET)}
            alt="MewMuze in the white and grey Flower Band appearance"
            width={768}
            height={768}
            unoptimized
          />
        ) : (
          <>
            {previous ? (
              <Image
                key={`previous-${previous[0]}`}
                className="showcase-cat-media is-previous"
                src={sitePath(`/cat/appearance/${previous[0]}.webp`)}
                alt=""
                width={512}
                height={512}
                unoptimized
              />
            ) : null}
            <Image
              key={activeId}
              className="showcase-cat-media is-current"
              src={sitePath(`/cat/appearance/${activeId}.webp`)}
              alt=""
              width={512}
              height={512}
              unoptimized
            />
          </>
        )}
      </div>
      <span className="showcase-ticket">
        <small>LIVE APPEARANCE / AUTHENTIC RENDERER</small>
        <strong>{activeLabel}</strong>
      </span>
      <div className="showcase-progress" aria-hidden="true">
        {appearanceShowcase.map(([id], index) => (
          <span key={id} className={index === activeIndex ? "is-active" : ""} />
        ))}
      </div>
      <p aria-live="polite">{activeLabel}</p>
    </div>
  );
}

function FeatureTheatre({
  reducedMotion,
  headingRef,
}: {
  reducedMotion: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const feature = featureStories[activeIndex];

  const show = useCallback((next: number) => {
    setActiveIndex(Math.min(featureStories.length - 1, Math.max(0, next)));
  }, []);

  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      show(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0);
    } else if (event.key === "End") {
      event.preventDefault();
      show(featureStories.length - 1);
    }
  };

  const finishSwipe = (event: PointerEvent<HTMLElement>) => {
    if (touchStart === null || event.pointerType === "mouse") return;
    const distance = event.clientX - touchStart;
    if (Math.abs(distance) > 46) show(activeIndex + (distance < 0 ? 1 : -1));
    setTouchStart(null);
  };

  return (
    <section
      className="feature-theatre section-shell"
      id="features"
      aria-labelledby="feature-theatre-title"
      onKeyDown={handleKeyboard}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") setTouchStart(event.clientX);
      }}
      onPointerUp={finishSwipe}
      onPointerCancel={() => setTouchStart(null)}
    >
      <div className="section-heading theatre-heading">
        <div>
          <Eyebrow>THE FEATURE THEATRE</Eyebrow>
          <h2 id="feature-theatre-title" ref={headingRef} tabIndex={-1}>
            One small companion.
            <br />
            <em>A surprisingly useful day.</em>
          </h2>
        </div>
        <p>
          Move through MewMuze&apos;s day one scene at a time. Nothing advances until
          you ask it to.
        </p>
      </div>

      <div
        className={`theatre-console accent-${feature.accent}`}
        aria-roledescription="carousel"
        aria-label="MewMuze feature stories"
      >
        <div className="console-rim" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <button
          className="theatre-arrow theatre-arrow-left"
          type="button"
          aria-label="Previous feature"
          disabled={activeIndex === 0}
          onClick={() => show(activeIndex - 1)}
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className="theatre-stage">
          <div className="theatre-media">
            <div className="media-label">
              <span>AUTHENTIC APP-RENDERED MOTION · TRANSPARENT</span>
              <i aria-hidden="true" />
            </div>
            <FeatureFilm feature={feature} reducedMotion={reducedMotion} />
            <span className="media-caption">{feature.demoLabel}</span>
          </div>

          <article className="theatre-copy" key={feature.id}>
            <div className="feature-index">
              <span>{feature.number}</span>
              <small>{feature.group}</small>
            </div>
            <p className="feature-scene">{feature.scene}</p>
            <h3>{feature.title}</h3>
            <p className="feature-story">{feature.story}</p>
            <p className="feature-detail">{feature.detail}</p>
            <ul>
              {feature.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </article>
        </div>

        <button
          className="theatre-arrow theatre-arrow-right"
          type="button"
          aria-label="Next feature"
          disabled={activeIndex === featureStories.length - 1}
          onClick={() => show(activeIndex + 1)}
        >
          <span aria-hidden="true">→</span>
        </button>

        <div className="theatre-progress" aria-label="Choose a feature">
          {featureStories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-label={`Feature ${item.number}: ${item.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => show(index)}
            >
              <span />
              <small>{item.shortTitle}</small>
            </button>
          ))}
        </div>
        <p className="carousel-status" aria-live="polite">
          Feature {activeIndex + 1} of {featureStories.length}: {feature.title}
        </p>
      </div>
    </section>
  );
}

const dayMoments = [
  {
    time: "8:47",
    title: "The tabs multiply.",
    copy: "MewMuze watches the cursor pick a path through the morning.",
    tone: "mint",
  },
  {
    time: "10:30",
    title: "Focus begins.",
    copy: "The cat parks beside a timer and leaves the pointer alone.",
    tone: "blue",
  },
  {
    time: "1:15",
    title: "Water, apparently.",
    copy: "A notebook notice arrives with a stretch and a patient stare.",
    tone: "peach",
  },
  {
    time: "3:00",
    title: "Meetings stack up.",
    copy: "Calendar warnings grow clearer while full-screen work stays quiet.",
    tone: "yellow",
  },
  {
    time: "5:48",
    title: "One last celebration.",
    copy: "A finished task earns a tiny cheer before the cat settles down.",
    tone: "pink",
  },
];

const bodies = ["Classic", "Chonk", "Fluffy", "Siamese", "Kitten"];
const patterns = ["Solid", "Tuxedo", "Tabby", "Socks", "Spotted", "Calico", "Bicolour"];
const futureConcepts = ["Mecha Hero", "Shield Guardian", "Web Scout", "Moon Mage"];

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [finePointer, setFinePointer] = useState(true);
  const [experienceUnlocked, setExperienceUnlocked] = useState(false);
  const [journeyState, setJourneyState] = useState<
    "idle" | "reacting" | "travelling" | "ready"
  >("idle");
  const heroRef = useRef<HTMLElement>(null);
  const catMotionRef = useRef<HTMLSpanElement>(null);
  const leftPupilRef = useRef<HTMLSpanElement>(null);
  const rightPupilRef = useRef<HTMLSpanElement>(null);
  const theatreHeadingRef = useRef<HTMLHeadingElement>(null);
  const forcedLookRef = useRef(false);
  const transitionTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const syncPreferences = () => {
      setReducedMotion(motionQuery.matches);
      setFinePointer(pointerQuery.matches);
    };
    syncPreferences();
    motionQuery.addEventListener("change", syncPreferences);
    pointerQuery.addEventListener("change", syncPreferences);
    return () => {
      motionQuery.removeEventListener("change", syncPreferences);
      pointerQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "mewmuze-scroll-locked",
      !experienceUnlocked,
    );
    document.body.classList.toggle("mewmuze-scroll-locked", !experienceUnlocked);
    if (!experienceUnlocked) window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("mewmuze-scroll-locked");
      document.body.classList.remove("mewmuze-scroll-locked");
    };
  }, [experienceUnlocked]);

  useEffect(
    () => () => {
      transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    let frame = 0;
    let isVisible = true;
    const target = { x: 0, y: 0 };
    const pupil = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    const render = () => {
      if (forcedLookRef.current) {
        const button = document.querySelector<HTMLElement>(".hero-explore");
        const cat = catMotionRef.current?.getBoundingClientRect();
        const buttonRect = button?.getBoundingClientRect();
        if (cat && buttonRect) {
          const centreX = cat.left + cat.width * 0.49;
          const centreY = cat.top + cat.height * 0.32;
          target.x = Math.max(
            -1,
            Math.min(1, (buttonRect.left + buttonRect.width / 2 - centreX) / 520),
          );
          target.y = Math.max(
            -1,
            Math.min(1, (buttonRect.top + buttonRect.height / 2 - centreY) / 380),
          );
        }
      }

      pupil.x += (target.x - pupil.x) * 0.28;
      pupil.y += (target.y - pupil.y) * 0.28;
      head.x += (target.x - head.x) * 0.075;
      head.y += (target.y - head.y) * 0.075;
      const pupilX = pupil.x * 13;
      const pupilY = pupil.y * 9;
      const headX = head.x * 8;
      const headY = head.y * 4.5;

      leftPupilRef.current?.style.setProperty(
        "transform",
        `translate3d(${pupilX}px, ${pupilY}px, 0)`,
      );
      rightPupilRef.current?.style.setProperty(
        "transform",
        `translate3d(${pupilX}px, ${pupilY}px, 0)`,
      );
      catMotionRef.current?.style.setProperty(
        "--look-transform",
        `translate3d(${headX}px, ${headY}px, 0) rotate(${head.x * 1.25}deg)`,
      );

      if (isVisible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(render);
      }
    };

    const track = (event: globalThis.PointerEvent) => {
      const cat = catMotionRef.current?.getBoundingClientRect();
      if (!cat) return;
      const centreX = cat.left + cat.width * 0.55;
      const centreY = cat.top + cat.height * 0.33;
      target.x = Math.max(-1, Math.min(1, (event.clientX - centreX) / (window.innerWidth * 0.42)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - centreY) / (window.innerHeight * 0.4)));
    };

    const returnToNeutral = () => {
      if (forcedLookRef.current) return;
      target.x = 0;
      target.y = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      window.cancelAnimationFrame(frame);
      if (isVisible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(render);
      }
    });

    const resume = () => {
      window.cancelAnimationFrame(frame);
      if (isVisible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(render);
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) observer.observe(heroElement);
    window.addEventListener("pointermove", track, { passive: true });
    heroElement?.addEventListener("pointerleave", returnToNeutral, {
      passive: true,
    });
    document.addEventListener("visibilitychange", resume);
    frame = window.requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", track);
      heroElement?.removeEventListener("pointerleave", returnToNeutral);
      document.removeEventListener("visibilitychange", resume);
      window.cancelAnimationFrame(frame);
    };
  }, [finePointer, reducedMotion]);

  const explore = () => {
    if (journeyState !== "idle") return;
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];

    const finish = (smooth: boolean) => {
      document.querySelector("#features")?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
      window.requestAnimationFrame(() => {
        theatreHeadingRef.current?.focus({ preventScroll: true });
      });
    };

    if (reducedMotion) {
      setExperienceUnlocked(true);
      setJourneyState("ready");
      window.requestAnimationFrame(() => finish(false));
      return;
    }

    forcedLookRef.current = true;
    setJourneyState("reacting");
    transitionTimersRef.current = [
      window.setTimeout(() => setJourneyState("travelling"), 230),
      window.setTimeout(() => setExperienceUnlocked(true), 720),
      window.setTimeout(() => finish(true), 1080),
      window.setTimeout(() => {
        forcedLookRef.current = false;
        setJourneyState("ready");
      }, 1650),
    ];
  };

  return (
    <main
      id="top"
      className={`experience-${experienceUnlocked ? "unlocked" : "locked"} journey-${journeyState}`}
    >
      <a
        className="skip-link"
        href="#features"
        onClick={(event) => {
          if (!experienceUnlocked) {
            event.preventDefault();
            explore();
          }
        }}
      >
        Skip to the MewMuze story
      </a>

      <section
        ref={heroRef}
        className={`hero ${!finePointer ? "touch-look" : ""}`}
        aria-labelledby="hero-title"
      >
        <div className="hero-edge" aria-hidden="true" />
        <div className="hero-cat-peek">
          <span
            ref={catMotionRef}
            className={`hero-cat-motion ${
              journeyState === "reacting" ? "is-reacting" : ""
            } ${journeyState === "travelling" ? "is-travelling" : ""}`}
          >
            <HeroCat leftPupilRef={leftPupilRef} rightPupilRef={rightPupilRef} />
          </span>
          <span className="cat-speech">Hi. I live here now.</span>
        </div>

        <div className="hero-copy">
          <Eyebrow>A PERSONAL DESKTOP CAT FOR WINDOWS</Eyebrow>
          <h1 id="hero-title">Your screen could use a little more life.</h1>
          <p className="hero-support">
            MewMuze lives quietly on your desktop—keeping you company, helping with the
            little things and making an ordinary workday feel a little less ordinary.
          </p>
          <div className="hero-actions">
            <SkeuoButton
              onClick={explore}
              className={`hero-explore ${journeyState !== "idle" ? "is-pressed" : ""}`}
            >
              Explore Now <span aria-hidden="true">↓</span>
            </SkeuoButton>
            <SkeuoButton onClick={explore} variant="quiet">
              See every feature
            </SkeuoButton>
          </div>
          <p className="privacy-note">
            <span aria-hidden="true">●</span> Cute companion. Real desktop utility.
            Local-first by design.
          </p>
        </div>

        <div className="hero-status" aria-hidden="true">
          <span>CURIOUS</span>
          <i />
          <small>cursor noticed</small>
        </div>
      </section>

      <header className="site-navigation">
        <SiteNavigation />
      </header>

      <section className="monotony section-shell section-pad" id="story">
        <div className="monotony-copy">
          <Eyebrow>THE ORDINARY DESKTOP</Eyebrow>
          <h2>
            Most desktops do their job.
            <br />
            <em>They just don&apos;t keep you company.</em>
          </h2>
          <p>
            The same windows. The same tabs. The same silent stretch between starting a
            task and finally finishing it.
          </p>
          <p className="story-turn">Then a tiny pair of green eyes appears.</p>
        </div>
        <AppearanceShowcase reducedMotion={reducedMotion} />
      </section>

      <FeatureTheatre reducedMotion={reducedMotion} headingRef={theatreHeadingRef} />

      <section className="day-story section-pad" aria-labelledby="day-title">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <Eyebrow>A DAY WITH MEWMUZE</Eyebrow>
              <h2 id="day-title">
                Useful in the little gaps.
                <br />
                <em>Quiet in the important ones.</em>
              </h2>
            </div>
            <p>A companion rhythm built around a real workday—not a dashboard demanding attention.</p>
          </div>
          <ol className="day-timeline">
            {dayMoments.map((moment) => (
              <li key={moment.time} className={`tone-${moment.tone}`}>
                <time>{moment.time}</time>
                <span className="timeline-pin" aria-hidden="true" />
                <div>
                  <h3>{moment.title}</h3>
                  <p>{moment.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="feature-directory section-shell section-pad" id="directory">
        <div className="section-heading">
          <div>
            <Eyebrow>THE COMPLETE FEATURE DIRECTORY</Eyebrow>
            <h2>
              Everything the cat can do.
              <br />
              <em>Grouped the way a day feels.</em>
            </h2>
          </div>
          <p>
            Every major verified MewMuze system, without speculative features or hidden
            fine print.
          </p>
        </div>
        <div className="directory-groups">
          {featureGroups.map((group, groupIndex) => {
            const entries = featureStories.filter((feature) => feature.group === group);
            return (
              <details key={group} open={groupIndex === 0}>
                <summary>
                  <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                  <strong>{group}</strong>
                  <small>{entries.length} features</small>
                  <i aria-hidden="true">+</i>
                </summary>
                <div className="directory-grid">
                  {entries.map((feature) => (
                    <article key={feature.id}>
                      <span className={`directory-dot accent-${feature.accent}`} aria-hidden="true" />
                      <small>{feature.number}</small>
                      <h3>{feature.title}</h3>
                      <p>{feature.story}</p>
                      <ul>
                        {feature.facts.map((fact) => (
                          <li key={fact}>{fact}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="appearance section-pad" id="appearance">
        <div className="section-shell appearance-shell">
          <div className="appearance-stage">
            <div className="studio-window">
              <div className="studio-titlebar">
                <span>APPEARANCE STUDIO / VERIFIED PRESET</span>
                <i />
                <i />
                <i />
              </div>
              <div className="studio-preview">
                <span className="studio-halo" aria-hidden="true" />
                <CatFigure className="studio-cat" />
                <span className="preset-ticket">
                  <strong>FLOWER BAND</strong>
                  <small>Classic · Tuxedo · Medium</small>
                </span>
              </div>
              <p>
                The preview uses the supplied current MewMuze preset. Exact body and coat
                rendering remains inside the app.
              </p>
            </div>
          </div>
          <div className="appearance-copy">
            <Eyebrow>APPEARANCE STUDIO</Eyebrow>
            <h2>
              Same personality.
              <br />
              <em>A cat that looks like yours.</em>
            </h2>
            <p>
              Body plans change real proportions before color and coat are applied. The
              website shows the verified choices without pretending to replace the app&apos;s
              renderer.
            </p>
            <div className="choice-block">
              <span>Body</span>
              <div>{bodies.map((body) => <b key={body}>{body}</b>)}</div>
            </div>
            <div className="choice-block">
              <span>Pattern</span>
              <div>{patterns.map((pattern) => <b key={pattern}>{pattern}</b>)}</div>
            </div>
            <div className="appearance-specs">
              <span>
                <small>Colors</small>
                Fur · eyes · inner ears
              </span>
              <span>
                <small>Size</small>
                Small · medium · large
              </span>
              <span>
                <small>Default accessory</small>
                None · Flower Band
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="store-teaser section-shell section-pad" id="store">
        <div className="store-teaser-card">
          <div>
            <Eyebrow>THE MEWMUZE WARDROBE</Eyebrow>
            <h2>
              The wardrobe is still
              <br />
              <em>being stitched.</em>
            </h2>
            <p>
              Original costume concepts are taking shape, but nothing is for sale or
              download yet.
            </p>
            <SkeuoButton href={sitePath("/store/")} variant="secondary">
              Visit the Coming Soon store <span aria-hidden="true">→</span>
            </SkeuoButton>
          </div>
          <div className="concept-stack" aria-label="Future original costume concepts">
            {futureConcepts.map((concept, index) => (
              <span key={concept} style={{ "--stack": index } as CSSProperties}>
                <i aria-hidden="true" />
                <strong>{concept}</strong>
                <small>Concept in progress</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="privacy section-pad" id="privacy">
        <div className="section-shell privacy-shell">
          <div className="privacy-copy">
            <Eyebrow>LOCAL-FIRST, CLEARLY EXPLAINED</Eyebrow>
            <h2>
              Company without
              <br />
              <em>the creepy part.</em>
            </h2>
            <p>
              MewMuze&apos;s desktop behavior stays local. Network features are off until
              you explicitly connect them.
            </p>
          </div>
          <div className="privacy-grid">
            {[
              ["Local file work", "Quick Tools processes selected images and PDFs on your computer."],
              ["Gmail envelope only", "Newest sender, subject, UID and unread count—never the email body."],
              ["Private calendar feed", "Upcoming timed events are fetched only after you add a private iCal address."],
              ["No microphone audio", "MewMuze reads capture-active state, not a recording or transcription."],
              ["No hidden screen reading", "Context uses broad app category and aggregate activity, not screen pixels."],
              ["Your reminders", "Reminder text is written by you and stays part of the local companion experience."],
            ].map(([title, copy]) => (
              <article key={title}>
                <span aria-hidden="true">✓</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing section-pad" id="pricing" aria-labelledby="pricing-title">
        <div className="section-shell pricing-shell">
          <div className="pricing-card">
            <div className="pricing-brand">
              <Image
                src={sitePath(FACE_LOGO_ASSET)}
                alt=""
                width={512}
                height={512}
                unoptimized
              />
              <span>
                <small>MEWMUZE FOR WINDOWS</small>
                <strong>MewMuze</strong>
              </span>
            </div>
            <div className="pricing-price">
              <small>ONE-TIME PRICE</small>
              <strong id="pricing-title">$5.99</strong>
              <span>No monthly or annual subscription.</span>
            </div>
            <ul>
              <li>Personal Windows desktop cat</li>
              <li>Expressive authentic animations</li>
              <li>Focus and reminder tools</li>
              <li>Local Quick Tools</li>
              <li>Smart Clipboard Assistant</li>
              <li>Appearance customization</li>
              <li>Local-first privacy</li>
              <li>Future feature improvements</li>
            </ul>
            <button className="skeuo-button skeuo-button-primary pricing-coming" type="button" disabled>
              Coming Soon
            </button>
            <p>Purchasing is not live yet. No order or payment is created here.</p>
          </div>
          <div className="pricing-copy">
            <Eyebrow>ONE CAT. ONE PRICE.</Eyebrow>
            <h2>
              A tiny desktop companion.
              <br />
              <em>Without another subscription.</em>
            </h2>
            <p>
              The planned one-time MewMuze price is clear now, while checkout remains
              honestly unavailable until the launch path is ready.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta section-shell section-pad" id="download">
        <div className="cta-cat">
          <CatFigure />
          <span>ready when you are.</span>
        </div>
        <div>
          <Eyebrow>WINDOWS 10 / 11 · 64-BIT</Eyebrow>
          <h2>Your desktop is ready to feel a little less empty.</h2>
          <p>
            Bring home a tiny companion for focus, reminders, quiet reactions and the
            ordinary minutes in between.
          </p>
          <div className="hero-actions">
            <SkeuoButton href="#pricing">View the $5.99 price</SkeuoButton>
            <SkeuoButton href="#directory" variant="quiet">
              See every feature
            </SkeuoButton>
          </div>
          <small>Warning: may cause unnecessary smiling during work hours.</small>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-shell">
          <a href="#top" aria-label="Back to the top">
            <SiteBrand />
          </a>
          <p>Personal desktop cat for Windows. Local-first by design.</p>
          <nav aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#appearance">Appearance</a>
            <a href={sitePath("/store/")}>Store · Coming Soon</a>
            <a href="#privacy">Privacy</a>
          </nav>
          <span>© 2026 MewMuze</span>
        </div>
      </footer>
    </main>
  );
}
