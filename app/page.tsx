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
import { checkoutUrlFor, commerce, commerceMode } from "../lib/commerce";
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
      <a href={sitePath("/support/")}>Support</a>
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
        <nav aria-label="Mobile navigation">
          {links}
          <a href="#pricing">Buy MewMuze</a>
        </nav>
      </details>
      <div className="nav-auth">
        <SkeuoButton href="#pricing" variant="primary" className="nav-cta nav-cta-signup">
          Buy MewMuze
        </SkeuoButton>
      </div>
    </div>
  );
}

/**
 * Opening curtain. Holds for a beat on a soft blue field, fills a loading bar,
 * then lifts away. Rendered on the server too, so there is no flash of the page
 * underneath before it appears.
 */
function WelcomeSplash() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 260 : 2150;
    const lift = reduced ? 120 : 720;
    const toLeaving = window.setTimeout(() => setPhase("leaving"), hold);
    const toGone = window.setTimeout(() => setPhase("gone"), hold + lift);
    return () => {
      window.clearTimeout(toLeaving);
      window.clearTimeout(toGone);
    };
  }, []);

  useEffect(() => {
    // Keep the page still underneath while the curtain is up.
    document.body.classList.toggle("mewmuze-splash-open", phase !== "gone");
    return () => document.body.classList.remove("mewmuze-splash-open");
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={phase === "leaving" ? "welcome-splash is-leaving" : "welcome-splash"}
      role="status"
      aria-live="polite"
    >
      <div className="splash-inner">
        {/* Same head, pupil and blink stack the hero uses, so the splash cat
            blinks with the app's own artwork. The eye sockets are positioned in
            percentages, so they land correctly in any square container. */}
        <span className="splash-cat" aria-hidden="true">
          {/* splash-disc is the white circle and the clip; splash-frame is the
              sprite's own 128 grid, scaled up and nudged so the head fills the
              circle. Keeping the frame as its own element means the eye sockets
              stay on the sprite's coordinates and need no recalibration. */}
          <span className="splash-disc">
            <span className="splash-frame">
              <Image
                className="splash-layer"
                src={sitePath(HERO_CAT_HEAD_ASSET)}
                alt=""
                width={128}
                height={128}
                unoptimized
                priority
              />
              <span className="hero-eye-track hero-eye-track-left">
                <span className="hero-pupil" />
              </span>
              <span className="hero-eye-track hero-eye-track-right">
                <span className="hero-pupil" />
              </span>
              <Image
                className="splash-layer splash-blink"
                src={sitePath(HERO_CAT_BLINK_ASSET)}
                alt=""
                width={128}
                height={128}
                unoptimized
                priority
              />
            </span>
          </span>
          <i className="splash-sparkle splash-sparkle-1" />
          <i className="splash-sparkle splash-sparkle-2" />
          <i className="splash-sparkle splash-sparkle-3" />
        </span>
        <p className="splash-title">Welcome to MewMuze</p>
        <p className="splash-sub">Waking up your desktop cat</p>
        <span className="splash-bar" aria-hidden="true">
          <i />
        </span>
      </div>
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
    title: "The first thing that looks back",
    copy: "You open the laptop the way you always do, half awake, already behind. The screen fills with the same tabs and the same quiet. Then something small lifts its head near the corner and watches your cursor move. It is not doing anything useful. It is just glad you are here.",
    tone: "mint",
  },
  {
    time: "10:30",
    title: "It sits down when you do",
    copy: "You start the timer and brace for the long stretch. The cat pads over, folds its paws, and settles beside it. No nudging, no badges, no advice. Just a small warm shape working alongside you, the way a real one would.",
    tone: "blue",
  },
  {
    time: "1:15",
    title: "Someone noticed before you did",
    copy: "Fifty two minutes and you have not moved. You did not count. It did. There is a stretch, a slow blink, and a patient stare you cannot argue with, so you finally stand up and roll your shoulders. Somebody was paying attention to you today.",
    tone: "peach",
  },
  {
    time: "3:00",
    title: "The hour you were dreading",
    copy: "Mail lands and it waves at you instead of buzzing. You drag the little body across the screen just to watch it stretch like warm dough, and it wobbles back into place looking mildly offended. You laugh out loud, alone, at your desk. The afternoon stops feeling flat.",
    tone: "yellow",
  },
  {
    time: "5:48",
    title: "You close the laptop last",
    copy: "The task finishes and it throws both paws in the air like it has been waiting all day for this. Then it yawns, turns twice, and curls up on the window edge to sleep. You linger a second before shutting the lid. Tomorrow it will be there before your coffee is.",
    tone: "blue",
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
  const supportSelected = supportDeveloper && commerce.supporterConfigured;
  const priceLabel = supportSelected ? "6.99" : "5.99";
  const checkoutUrl = checkoutUrlFor(supportSelected);
  const heroRef = useRef<HTMLElement>(null);
  const catMotionRef = useRef<HTMLSpanElement>(null);
  const heroHeadRef = useRef<HTMLSpanElement>(null);
  const leftPupilRef = useRef<HTMLSpanElement>(null);
  const rightPupilRef = useRef<HTMLSpanElement>(null);
  // Read inside the animation loop so a mood change retunes the motion without
  // tearing down and restarting the frame loop.
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

  // The cursor tracking loop that moved the head and pupils has been removed.
  // The pupils now sit centred, looking straight ahead, and the cat's life comes
  // entirely from its own animations: the rotating emotions, the blink, the ear
  // flicks and the idle breathe.

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
      <WelcomeSplash />
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
            MewMuze lives quietly on your desktop, keeping you company, helping with the
            little things, and making an ordinary workday feel a little less ordinary.
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
            You give the best hours of your day to a screen. The same three windows. The
            same tabs. The same long silence between starting something and finally
            finishing it. Nothing is going badly. It is just flat, and quiet in a way
            nobody really admits to.
          </p>
          <p>
            A companion will not fix your job or empty your inbox. What it changes is the
            texture of the hours you spend on them, and that turns out to matter far more
            than it sounds like it should.
          </p>
          <p className="story-turn">Then a small pair of green eyes looks up at you.</p>
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
            <p>A companion rhythm built around a real workday, not a dashboard demanding attention.</p>
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
              ["Gmail envelope only", "Newest sender, subject, UID and unread count. Never the email body."],
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

      <section className="account-section section-pad" id="account" data-reveal>
        <div className="section-shell account-shell">
          <div className="account-copy-block">
            <Eyebrow>ONE SAFE PURCHASE FLOW</Eyebrow>
            <h2>
              Dodo handles the payment.
              <br />
              <em>MewMuze handles the cat.</em>
            </h2>
            <p>
              Checkout stays on Dodo Payments, where local currencies, regional
              payment methods, tax, receipts and refunds are handled securely. MewMuze
              never receives or stores your card details.
            </p>
            <ul className="account-perks">
              <li>
                <strong>Pay in the currency Dodo offers you</strong>
                <span>The hosted checkout localises the final amount and payment methods.</span>
              </li>
              <li>
                <strong>Your licence arrives immediately</strong>
                <span>It appears after payment and is also delivered to your checkout email.</span>
              </li>
              <li>
                <strong>Activation stays private</strong>
                <span>The app stores the key in your operating system credential vault.</span>
              </li>
            </ul>
          </div>
          <div className="account-panel purchase-flow-panel">
            <span className="account-badge" aria-hidden="true">
              <i />
            </span>
            <ol className="purchase-flow-steps">
              <li>
                <strong>1. Secure checkout</strong>
                <span>Complete the one-time payment on Dodo Payments.</span>
              </li>
              <li>
                <strong>2. Copy your licence</strong>
                <span>The success page and email both contain the same key.</span>
              </li>
              <li>
                <strong>3. Unlock MewMuze</strong>
                <span>Paste it in Cat Settings. No permanent internet connection is needed.</span>
              </li>
            </ol>
            <a className="skeuo-button skeuo-button-quiet" href={sitePath("/support/")}>
              Purchase &amp; licence help
            </a>
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
            {commerce.supporterConfigured && (
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
            )}
            {commerce.configured ? (
              <a
                className="skeuo-button skeuo-button-primary pricing-gate"
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
              >
                {commerceMode === "test" ? "Open secure test checkout" : "Buy MewMuze securely"}
              </a>
            ) : (
              <button
                className="skeuo-button skeuo-button-primary pricing-coming"
                type="button"
                disabled
              >
                Checkout configuration pending
              </button>
            )}
            <p>
              {commerceMode === "test"
                ? "Test mode uses Dodo's sandbox: no real charge is made."
                : "Secure checkout is hosted by Dodo Payments. MewMuze never sees your card details."}
            </p>
          </div>
          <div className="pricing-copy">
            <Eyebrow>ONE CAT. ONE PRICE. ONCE.</Eyebrow>
            <h2>
              Buy it once.
              <br />
              <em>Then never think about it again.</em>
            </h2>
            <p>
              No monthly plan. No annual renewal. The checkout, receipt, tax and
              licence delivery are handled by Dodo Payments. You pay a single time and
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
                <span>Costumes added after you buy are included, so you never buy your cat twice.</span>
              </li>
            </ul>
            <p className="pricing-footnote">
              {commerceMode === "test"
                ? "The complete purchase and licence flow is connected to Dodo test mode while launch checks are completed."
                : "The final amount and available methods are shown by Dodo Payments before you confirm."}
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
