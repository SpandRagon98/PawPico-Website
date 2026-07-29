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
import {
  featureGroups,
  featureStories,
  type FeatureNotice,
  type FeatureStory,
} from "../data/features";
import { sitePath } from "../lib/site-path";

const CAT_ASSET = "/cat/mewmuze-hero-reference-app.png";
const HERO_CAT_BODY_ASSET = "/cat/mewmuze-hero-front-body-app.png";
const HERO_CAT_BODY_ALIVE_ASSET = "/cat/mewmuze-hero-front-body-alive.webp";
const HERO_CAT_HEAD_ASSET = "/cat/mewmuze-hero-front-head-app.png";
const HERO_CAT_BLINK_ASSET = "/cat/mewmuze-hero-front-head-blink-app.png";
const HERO_CAT_EARS_ASSET = "/cat/mewmuze-hero-front-head-ears-app.png";
const FACE_LOGO_ASSET = "/cat/mewmuze-face-logo-hd.png";

const heroEmotionAssets = {
  happy: "/cat/hero-emotions/happy.webp",
  sad: "/cat/hero-emotions/sad.webp",
  cheerful: "/cat/hero-emotions/cheerful.webp",
} as const;

type HeroEmotion = "neutral" | keyof typeof heroEmotionAssets;

// How the head and eyes behave in each mood. Tuned by eye against the real app
// sprites: a sad cat looks down and tracks lazily, a cheerful one snaps around.
type EmotionRig = {
  headEase: number;
  pupilEase: number;
  headGain: number;
  pupilGain: number;
  tiltGain: number;
  tiltBias: number;
  headDrop: number;
  gazeDrop: number;
  sway: number;
  swaySpeed: number;
  puff: number;
};

const emotionRigs: Record<HeroEmotion, EmotionRig> = {
  neutral: {
    headEase: 0.105, pupilEase: 0.34, headGain: 1, pupilGain: 1,
    tiltGain: 1, tiltBias: 0, headDrop: 0, gazeDrop: 0,
    sway: 1.5, swaySpeed: 0.62, puff: 0,
  },
  happy: {
    headEase: 0.15, pupilEase: 0.42, headGain: 1.12, pupilGain: 1.15,
    tiltGain: 1.25, tiltBias: 0, headDrop: -2.4, gazeDrop: -1.2,
    sway: 2.6, swaySpeed: 1.35, puff: 0.014,
  },
  cheerful: {
    headEase: 0.19, pupilEase: 0.5, headGain: 1.24, pupilGain: 1.3,
    tiltGain: 1.5, tiltBias: -1.1, headDrop: -3.4, gazeDrop: -1.8,
    sway: 3.4, swaySpeed: 1.95, puff: 0.02,
  },
  sad: {
    headEase: 0.06, pupilEase: 0.2, headGain: 0.72, pupilGain: 0.66,
    tiltGain: 0.6, tiltBias: 1.4, headDrop: 3.6, gazeDrop: 2.6,
    sway: 0.8, swaySpeed: 0.34, puff: -0.008,
  },
};

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
        width={128}
        height={128}
        unoptimized
        priority={priority}
      />
    </span>
  );
}

function HeroCat({
  headUnitRef,
  leftPupilRef,
  rightPupilRef,
  emotion,
  reducedMotion,
}: {
  headUnitRef: RefObject<HTMLSpanElement | null>;
  leftPupilRef: RefObject<HTMLSpanElement | null>;
  rightPupilRef: RefObject<HTMLSpanElement | null>;
  emotion: HeroEmotion;
  reducedMotion: boolean;
}) {
  return (
    <span className={`hero-cat-art emotion-${emotion}`} aria-hidden="true">
      <Image
        className="hero-cat-layer hero-cat-body"
        src={sitePath(
          reducedMotion ? HERO_CAT_BODY_ASSET : HERO_CAT_BODY_ALIVE_ASSET,
        )}
        alt=""
        width={128}
        height={128}
        unoptimized
        priority
      />
      <span ref={headUnitRef} className="hero-cat-head-unit">
        <Image
          className="hero-cat-layer hero-cat-head"
          src={sitePath(HERO_CAT_HEAD_ASSET)}
          alt=""
          width={128}
          height={128}
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
          width={128}
          height={128}
          unoptimized
        />
        <Image
          className="hero-cat-layer hero-cat-expression hero-cat-blink"
          src={sitePath(HERO_CAT_BLINK_ASSET)}
          alt=""
          width={128}
          height={128}
          unoptimized
        />
      </span>
      {Object.entries(heroEmotionAssets).map(([name, asset]) => (
        <Image
          key={name}
          className={`hero-cat-layer hero-cat-emotion hero-cat-emotion-${name}`}
          src={sitePath(asset)}
          alt=""
          width={128}
          height={128}
          loading="eager"
          unoptimized
        />
      ))}
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

/** The app's own notice, recreated on the site so the popup reads as familiar. */
function AppNotice({ notice, className = "" }: { notice: FeatureNotice; className?: string }) {
  return (
    <span className={`app-notice ${className}`} role="status">
      <span className="app-notice-app">
        <i aria-hidden="true" />
        {notice.app}
      </span>
      <strong>{notice.title}</strong>
      <small>{notice.body}</small>
    </span>
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
      width={128}
      height={128}
      unoptimized
    />
  );
}

const appearanceShowcase = [
  ["white-grey-flower", "White & grey · calm"],
  ["orange-happy", "Orange · happy"],
  ["calico-wave", "Calico · wave"],
  ["tuxedo-placard", "Black tuxedo · placard"],
  ["tabby-groom", "Grey tabby · groom"],
  ["fluffy-stretch", "White fluffy · stretch"],
  ["kitten-yawn", "Bicolour kitten · yawn"],
  ["siamese-celebrate", "Siamese · celebration"],
] as const;

function AppearanceShowcase({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
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
      setActiveIndex((current) => (current + 1) % appearanceShowcase.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [isVisible, reducedMotion]);

  const [, activeLabel] = appearanceShowcase[activeIndex];

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
        {reducedMotion ? (
          <Image
            className="showcase-cat-static"
            src={sitePath(CAT_ASSET)}
            alt="MewMuze in the white and grey Flower Band appearance"
            width={128}
            height={128}
            unoptimized
          />
        ) : (
          appearanceShowcase.map(([id, label], index) => (
            <Image
              key={id}
              className={`showcase-cat-media ${
                index === activeIndex ? "is-current" : ""
              }`}
              src={sitePath(`/cat/appearance/${id}.webp`)}
              alt={index === activeIndex ? `MewMuze appearance: ${label}` : ""}
              aria-hidden={index === activeIndex ? undefined : "true"}
              width={128}
              height={128}
              loading="eager"
              unoptimized
            />
          ))
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

function FeatureTheatre({ reducedMotion }: { reducedMotion: boolean }) {
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
      data-reveal
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
          <h2 id="feature-theatre-title">
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

        <div className="theatre-stage">
          <div className="theatre-media">
            <div className="media-label">
              <span>AUTHENTIC APP-RENDERED MOTION · TRANSPARENT</span>
              <i aria-hidden="true" />
            </div>
            <FeatureFilm feature={feature} reducedMotion={reducedMotion} />
            {feature.notice && (
              <AppNotice key={feature.id} notice={feature.notice} className="notice-float" />
            )}
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
            <div className="feature-helps">
              <small>WHAT THIS CHANGES FOR YOU</small>
              <p>{feature.helps}</p>
            </div>
            <p className="feature-detail">{feature.detail}</p>
            <ul>
              {feature.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="theatre-controls">
          <button
            className="theatre-arrow theatre-arrow-left"
            type="button"
            aria-label="Previous feature"
            disabled={activeIndex === 0}
            onClick={() => show(activeIndex - 1)}
          >
            <span aria-hidden="true">←</span>
            <small>Previous</small>
          </button>
          <div className="theatre-counter" aria-hidden="true">
            <small>
              FEATURE {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {featureStories.length}
            </small>
            <strong>{feature.title}</strong>
          </div>
          <button
            className="theatre-arrow theatre-arrow-right"
            type="button"
            aria-label="Next feature"
            disabled={activeIndex === featureStories.length - 1}
            onClick={() => show(activeIndex + 1)}
          >
            <small>Next</small>
            <span aria-hidden="true">→</span>
          </button>
        </div>

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
              <span>{item.number}</span>
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

const bodyOptions = [
  ["Classic", "classic"],
  ["Chonk", "chonk"],
  ["Fluffy", "fluffy"],
  ["Siamese", "siamese"],
  ["Kitten", "kitten"],
] as const;

const patternOptions = [
  ["Solid", "solid"],
  ["Tuxedo", "tuxedo"],
  ["Tabby", "tabby"],
  ["Socks", "socks"],
  ["Spotted", "spotted"],
  ["Calico", "calico"],
  ["Bicolour", "bicolour"],
] as const;

function FeatureDirectory() {
  const [openGroup, setOpenGroup] = useState(0);

  return (
    <div className="directory-groups">
      {featureGroups.map((group, groupIndex) => {
        const entries = featureStories.filter((feature) => feature.group === group);
        const isOpen = openGroup === groupIndex;
        const panelId = `directory-panel-${groupIndex}`;
        return (
          <section
            key={group}
            className={`directory-panel ${isOpen ? "is-open" : ""}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenGroup(isOpen ? -1 : groupIndex)}
              >
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <strong>{group}</strong>
                <small>{entries.length} features</small>
                <i aria-hidden="true">+</i>
              </button>
            </h3>
            <div
              className="directory-reveal"
              id={panelId}
              aria-hidden={!isOpen}
            >
              <div className="directory-grid">
                {entries.map((feature) => (
                  <article key={feature.id}>
                    <span
                      className={`directory-dot accent-${feature.accent}`}
                      aria-hidden="true"
                    />
                    <small>{feature.number}</small>
                    <h4>{feature.title}</h4>
                    <p>{feature.story}</p>
                    <div className="directory-helps">
                      <small>HOW IT HELPS</small>
                      <p>{feature.helps}</p>
                    </div>
                    {feature.notice && (
                      <AppNotice notice={feature.notice} className="notice-inline" />
                    )}
                    <ul>
                      {feature.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AppearanceStudio() {
  const [body, setBody] = useState<(typeof bodyOptions)[number][1]>("classic");
  const [pattern, setPattern] =
    useState<(typeof patternOptions)[number][1]>("solid");
  const bodyLabel = bodyOptions.find((option) => option[1] === body)?.[0] ?? "Classic";
  const patternLabel =
    patternOptions.find((option) => option[1] === pattern)?.[0] ?? "Solid";
  const asset = `/cat/studio/${body}-${pattern}.webp`;

  return (
    <>
      <div className="appearance-stage">
        <div className="studio-window">
          <div className="studio-titlebar">
            <span>APPEARANCE STUDIO / LIVE APP RENDERER</span>
            <i />
            <i />
            <i />
          </div>
          <div className="studio-preview">
            <span className="studio-halo" aria-hidden="true" />
            <Image
              key={asset}
              className="studio-cat-media"
              src={sitePath(asset)}
              alt={`Animated ${bodyLabel} MewMuze cat with the ${patternLabel} coat pattern`}
              width={128}
              height={128}
              unoptimized
            />
            <span className="studio-live-badge" aria-hidden="true">
              <i />
              LIVE EMOTION
            </span>
            <span className="preset-ticket">
              <strong>FLOWER BAND</strong>
              <small>
                {bodyLabel} · {patternLabel} · animated
              </small>
            </span>
          </div>
          <p aria-live="polite">
            Showing the authentic {bodyLabel} body with the {patternLabel} coat
            pattern and a looping app-rendered emotion.
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
          Choose a body and coat pattern to see the real MewMuze renderer update
          the animated cat immediately.
        </p>
        <div className="choice-block">
          <span>Body</span>
          <div>
            {bodyOptions.map(([label, value]) => (
              <button
                key={value}
                type="button"
                className={body === value ? "is-active" : ""}
                aria-pressed={body === value}
                onClick={() => setBody(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="choice-block">
          <span>Pattern</span>
          <div>
            {patternOptions.map(([label, value]) => (
              <button
                key={value}
                type="button"
                className={pattern === value ? "is-active" : ""}
                aria-pressed={pattern === value}
                onClick={() => setPattern(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="appearance-specs">
          <span>
            <small>Colors</small>
            White base · green eyes · pink ears
          </span>
          <span>
            <small>Motion</small>
            Blink · curious look · happy response
          </span>
          <span>
            <small>Accessory</small>
            Flower Band
          </span>
        </div>
      </div>
    </>
  );
}

const dayMoments = [
  {
    time: "8:47",
    title: "You are not quite alone.",
    copy: "The tabs multiply like they always do. Something small notices your cursor and follows it, and the morning starts a little differently.",
    tone: "mint",
  },
  {
    time: "10:30",
    title: "It sits down to work with you.",
    copy: "Focus begins. The cat parks beside the timer, goes still, and leaves the pointer alone — company without commentary.",
    tone: "blue",
  },
  {
    time: "1:15",
    title: "Someone noticed before you did.",
    copy: "Fifty-two minutes without moving. A notebook notice arrives with a stretch and a patient stare, and you finally stand up.",
    tone: "peach",
  },
  {
    time: "3:00",
    title: "The afternoon stops being flat.",
    copy: "Mail arrives and it waves instead of buzzing. You drag the cat across the screen, it stretches like warm dough, and the hour you were dreading passes differently.",
    tone: "yellow",
  },
  {
    time: "5:48",
    title: "You close the laptop last.",
    copy: "A finished task earns a tiny cheer. Then it yawns, curls up on the window edge and sleeps — and it will be there before your coffee tomorrow.",
    tone: "pink",
  },
];

const futureConcepts = ["Mecha Hero", "Shield Guardian", "Web Scout", "Moon Mage"];

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [finePointer, setFinePointer] = useState(true);
  // Starts true: the landing hero used to lock scrolling until a button was
  // pressed. Every lock/force-scroll/gate below only fires when this is
  // false, so starting unlocked removes the lock entirely without touching
  // the effect, the buttons, or the one-time "assemble" animation they used
  // to trigger - it now just plays once on mount instead.
  const [experienceUnlocked, setExperienceUnlocked] = useState(true);
  const [heroEmotion, setHeroEmotion] = useState<HeroEmotion>("neutral");
  const [supportDeveloper, setSupportDeveloper] = useState(false);
  const priceLabel = supportDeveloper ? "6.99" : "5.99";
  const heroRef = useRef<HTMLElement>(null);
  const catMotionRef = useRef<HTMLSpanElement>(null);
  const heroHeadRef = useRef<HTMLSpanElement>(null);
  const leftPupilRef = useRef<HTMLSpanElement>(null);
  const rightPupilRef = useRef<HTMLSpanElement>(null);
  // Read inside the animation loop so a mood change retunes the motion without
  // tearing down and restarting the frame loop.
  const emotionRigRef = useRef<EmotionRig>(emotionRigs.neutral);

  useEffect(() => {
    emotionRigRef.current = emotionRigs[heroEmotion];
  }, [heroEmotion]);

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

  useEffect(() => {
    if (reducedMotion) {
      const neutralTimer = window.setTimeout(() => setHeroEmotion("neutral"), 0);
      return () => window.clearTimeout(neutralTimer);
    }

    const emotions: Exclude<HeroEmotion, "neutral">[] = [
      "happy",
      "cheerful",
      "sad",
    ];
    let emotionIndex = 0;
    let neutralTimer = 0;

    const showNextEmotion = () => {
      setHeroEmotion(emotions[emotionIndex]);
      emotionIndex = (emotionIndex + 1) % emotions.length;
      window.clearTimeout(neutralTimer);
      neutralTimer = window.setTimeout(() => setHeroEmotion("neutral"), 2400);
    };

    const openingTimer = window.setTimeout(showNextEmotion, 2200);
    const emotionTimer = window.setInterval(showNextEmotion, 5200);

    return () => {
      window.clearTimeout(openingTimer);
      window.clearTimeout(neutralTimer);
      window.clearInterval(emotionTimer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    document.documentElement.classList.add("mewmuze-reveal-ready");
    if (reducedMotion) {
      sections.forEach((section) => section.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;
    let isVisible = true;
    const target = { x: 0, y: 0 };
    const pupil = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };
    const start = performance.now();

    const render = () => {
      // Each mood leans, bobs and looks around differently, so the head and the
      // eyes read as the same animal changing feeling rather than a moving image.
      const rig = emotionRigRef.current;
      pupil.x += (target.x - pupil.x) * rig.pupilEase;
      pupil.y += (target.y - pupil.y) * rig.pupilEase;
      head.x += (target.x - head.x) * rig.headEase;
      head.y += (target.y - head.y) * rig.headEase;

      // Idle life: a slow breathing sway so the cat never looks frozen, and so
      // touch devices (which have no cursor to follow) still get a living cat.
      const seconds = (performance.now() - start) / 1000;
      const swayX = Math.sin(seconds * rig.swaySpeed) * rig.sway;
      const swayY = Math.sin(seconds * rig.swaySpeed * 1.7 + 1.1) * rig.sway * 0.6;

      const pupilX = pupil.x * 14.5 * rig.pupilGain + swayX * 1.4;
      const pupilY = pupil.y * 9 * rig.pupilGain + swayY * 1.1 + rig.gazeDrop;
      const headX = head.x * 16 * rig.headGain + swayX;
      const headY = head.y * 8 * rig.headGain + swayY + rig.headDrop;
      const headTilt =
        (head.x * 3.2 - head.y * 0.45) * rig.tiltGain + swayX * 0.4 + rig.tiltBias;
      const headScale =
        1 + Math.min(1, Math.hypot(head.x, head.y)) * 0.012 + rig.puff;

      leftPupilRef.current?.style.setProperty(
        "transform",
        `translate3d(${pupilX}px, ${pupilY}px, 0)`,
      );
      rightPupilRef.current?.style.setProperty(
        "transform",
        `translate3d(${pupilX}px, ${pupilY}px, 0)`,
      );
      if (heroHeadRef.current) {
        heroHeadRef.current.style.transform =
          `translate3d(${headX}px, ${headY}px, 0) rotate(${headTilt}deg) scale(${headScale})`;
      }

      if (isVisible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(render);
      }
    };

    const track = (event: globalThis.PointerEvent) => {
      const cat = catMotionRef.current?.getBoundingClientRect();
      if (!cat) return;
      const centreX = cat.left + cat.width * 0.55;
      const centreY = cat.top + cat.height * 0.33;
      target.x = Math.max(
        -1,
        Math.min(1, (event.clientX - centreX) / (window.innerWidth * 0.28)),
      );
      target.y = Math.max(
        -1,
        Math.min(1, (event.clientY - centreY) / (window.innerHeight * 0.3)),
      );
    };

    const returnToNeutral = () => {
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
  }, [reducedMotion]);

  const unlockAndScroll = (targetId: "#story" | "#features" | "#pricing") => {
    document.documentElement.classList.remove("mewmuze-scroll-locked");
    document.body.classList.remove("mewmuze-scroll-locked");
    setExperienceUnlocked(true);
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(targetId);
      if (!target) return;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }, 80);
  };

  return (
    <main
      id="top"
      className={`experience-${experienceUnlocked ? "unlocked" : "locked"}`}
    >
      <a
        className="skip-link"
        href="#story"
        onClick={(event) => {
          if (!experienceUnlocked) {
            event.preventDefault();
            unlockAndScroll("#story");
          }
        }}
      >
        Skip to the MewMuze story
      </a>

      <header className="site-navigation">
        <SiteNavigation />
      </header>

      <section
        ref={heroRef}
        className={`hero ${!finePointer ? "touch-look" : ""}`}
        aria-labelledby="hero-title"
      >
        <div className="hero-edge" aria-hidden="true" />
        <div className="hero-cat-peek">
          <span
            ref={catMotionRef}
            className="hero-cat-motion"
          >
            <HeroCat
              headUnitRef={heroHeadRef}
              leftPupilRef={leftPupilRef}
              rightPupilRef={rightPupilRef}
              emotion={heroEmotion}
              reducedMotion={reducedMotion}
            />
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
              onClick={() => unlockAndScroll("#pricing")}
              className="hero-buy"
            >
              {`Get MewMuze · $${priceLabel}`}
            </SkeuoButton>
            <SkeuoButton
              onClick={() => unlockAndScroll("#story")}
              variant="secondary"
              className="hero-explore"
            >
              Explore Now <span aria-hidden="true">↓</span>
            </SkeuoButton>
            <SkeuoButton onClick={() => unlockAndScroll("#features")} variant="quiet">
              See every feature
            </SkeuoButton>
          </div>
          <p className="privacy-note">
            <span aria-hidden="true">●</span> Cute companion. Real desktop utility.
            Local-first by design.
          </p>
        </div>

        <div className="hero-status" aria-hidden="true">
          <span>{heroEmotion === "neutral" ? "CURIOUS" : heroEmotion.toUpperCase()}</span>
          <i />
          <small>
            {heroEmotion === "neutral" ? "cursor noticed" : "tiny mood moment"}
          </small>
        </div>
      </section>

      <section className="monotony section-shell section-pad" id="story" data-reveal>
        <div className="monotony-copy">
          <Eyebrow>THE ORDINARY DESKTOP</Eyebrow>
          <h2>
            Nothing is wrong.
            <br />
            <em>That is somehow the problem.</em>
          </h2>
          <p>
            You spend the best hours of your day alone with a screen. The same three
            windows. The same tabs. The same silent stretch between starting something
            and finally finishing it. Not bad, exactly. Just flat — and quiet in a way
            nobody really talks about.
          </p>
          <p>
            A companion does not fix your job or your inbox. It changes the texture of
            the hours you spend on them, which turns out to matter far more than it
            sounds like it should.
          </p>
          <p className="story-turn">Then a tiny pair of green eyes looks up at you.</p>
        </div>
        <AppearanceShowcase reducedMotion={reducedMotion} />
      </section>

      <FeatureTheatre reducedMotion={reducedMotion} />

      <section className="day-story section-pad" aria-labelledby="day-title" data-reveal>
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

      <section className="feature-directory section-shell section-pad" id="directory" data-reveal>
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
        <FeatureDirectory />
      </section>

      <section className="appearance section-pad" id="appearance" data-reveal>
        <div className="section-shell appearance-shell">
          <AppearanceStudio />
        </div>
      </section>

      <section className="store-teaser section-shell section-pad" id="store" data-reveal>
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

      <section className="privacy section-pad" id="privacy" data-reveal>
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

      <section className="pricing section-pad" id="pricing" aria-labelledby="pricing-title" data-reveal>
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
              <strong id="pricing-title">{`$${priceLabel}`}</strong>
              <span>Pay once. No subscription, ever.</span>
            </div>
            <ul>
              <li>Personal Windows desktop cat</li>
              <li>Expressive authentic animations</li>
              <li>Focus and reminder tools</li>
              <li>Local Quick Tools</li>
              <li>Smart Clipboard Assistant</li>
              <li>Appearance customization</li>
              <li>Local-first privacy</li>
              <li>All future updates and costumes included</li>
            </ul>
            <label className="tip-toggle">
              <input
                type="checkbox"
                checked={supportDeveloper}
                onChange={(event) => setSupportDeveloper(event.target.checked)}
              />
              <span className="tip-box" aria-hidden="true" />
              <span className="tip-copy">
                <strong>Add $1 to support the developer</strong>
                <small>
                  One person builds MewMuze. This buys the coffee behind the next
                  update.
                </small>
              </span>
            </label>
            <button className="skeuo-button skeuo-button-primary pricing-coming" type="button" disabled>
              Coming Soon
            </button>
            <p>Purchasing is not live yet. No order or payment is created here.</p>
          </div>
          <div className="pricing-copy">
            <Eyebrow>ONE CAT. ONE PRICE. ONCE.</Eyebrow>
            <h2>
              Buy it once.
              <br />
              <em>Then never think about it again.</em>
            </h2>
            <p>
              No monthly plan. No annual renewal. No account to make and no card left
              on file waiting to charge you in eleven months. You pay a single time and
              the cat is yours.
            </p>
            <ul className="pricing-promises">
              <li>
                <strong>One payment, kept forever</strong>
                <span>There is no subscription to cancel, because there is no subscription.</span>
              </li>
              <li>
                <strong>Every future update, free</strong>
                <span>New features, new animations and new costumes arrive at no extra cost.</span>
              </li>
              <li>
                <strong>The wardrobe keeps growing</strong>
                <span>Costumes added after you buy are included — you never re-purchase your cat.</span>
              </li>
            </ul>
            <p className="pricing-footnote">
              The planned one-time MewMuze price is clear now, while checkout remains
              honestly unavailable until the launch path is ready.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta section-shell section-pad" id="download" data-reveal>
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
            <SkeuoButton href="#pricing">{`View the $${priceLabel} price`}</SkeuoButton>
            <SkeuoButton href="#directory" variant="quiet">
              See every feature
            </SkeuoButton>
          </div>
          <small>
            One-time payment · no subscription · future updates and costumes included.
          </small>
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
