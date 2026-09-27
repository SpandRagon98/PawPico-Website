"use client";

import Image from "next/image";
import { GlassSurface } from "./GlassSurface";
import { HeroCatCanvas, type Rgb } from "./HeroCatCanvas";

/** The jacket's colour: matches hero-neon.css's --hero-neon green palette. */
const HERO_JACKET: Rgb = [0.43, 1, 0.18];
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
  type ReactNode,
} from "react";
import {
  featureGroups,
  featureStories,
  type FeatureNotice,
  type FeatureStory,
} from "../data/features";
import {
  checkoutUrlFor,
  commerce,
  commerceMode,
  prefersRupees,
  priceLabelFor,
} from "../lib/commerce";
import { sitePath } from "../lib/site-path";
import { SiteBrand, SiteNav } from "../components/SiteNav";
import { AdaptsLab } from "../components/AdaptsLab";
import { DownloadButton } from "../components/DownloadButton";
import { ColdOpen } from "../components/story/ColdOpen";
import { DayWithHer } from "../components/story/DayWithHer";
import { Receipts } from "../components/story/Receipts";
import { ClosingBeat } from "../components/story/ClosingBeat";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mewmuze.com";

// The purchasable app, described for search engines.
//
// Price is the USD list price only. Indian visitors are shown ₹549 and Dodo owns
// the final localized amount at checkout. Structured data carries a single offer,
// so it advertises the global list price rather than a region specific one.
//
// No aggregateRating or review: there are no real reviews to cite, and inventing
// them is a spam policy violation.
const appStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#app`,
  name: "MewMuze",
  description:
    "Meet MewMuze, a playful Windows desktop companion with focus tools, smart reminders, local utilities, expressive animations and a customizable personality.",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og-mewmuze.png`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows 10, Windows 11",
  softwareVersion: "0.1.10",
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: {
    "@type": "Offer",
    price: "7.99",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/`,
  },
};

const CAT_ASSET = "/cat/mewmuze-hero-reference-app.png";
const FACE_LOGO_ASSET = "/cat/mewmuze-face-logo-hd.png";

/** The visitor's timezone cannot change mid-visit, so there is nothing to subscribe to. */
const noSubscribe = () => () => {};
const serverPrefersRupees = () => false;


function useVisibleMotion(ref: RefObject<HTMLElement | null>, initiallyVisible = false) {
  const [active, setActive] = useState(initiallyVisible);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = initiallyVisible;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: "120px" });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, initiallyVisible]);
  return active;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
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

function FeatureAvailability({ feature }: { feature: FeatureStory }) {
  if (!feature.availability) return null;

  const { free, pro, paper } = feature.availability;
  const availabilityLabel = paper
    ? "In the Paper preview build only"
    : free
      ? "Available in the Free and Pro editions"
      : "Available in the Pro edition";

  return (
    <div
      className="feature-availability"
      aria-label={availabilityLabel}
    >
      {free && (
        <span className="availability-free">FREE <i aria-hidden="true">✓</i></span>
      )}
      {pro && (
        <span className="availability-pro">PRO <i aria-hidden="true">✓</i></span>
      )}
      {paper && <span className="availability-paper">PAPER PREVIEW</span>}
    </div>
  );
}

function FeatureDirectory() {
  // Every group starts closed: the directory is a long list, and opening one
  // by default buried the groups under it.
  const [openGroup, setOpenGroup] = useState(-1);

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
                    <FeatureAvailability feature={feature} />
                    <p>{feature.story}</p>
                    <div className="directory-helps">
                      <small>HOW IT HELPS</small>
                      <ul>
                        {feature.helps.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    {feature.notice && (
                      <AppNotice notice={feature.notice} className="notice-inline" />
                    )}
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

function ScrollPet({ reducedMotion }: { reducedMotion: boolean }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (reducedMotion || window.matchMedia("(max-width: 1100px)").matches) return;
    const sections = ["desktop", "features", "moods", "appearance", "privacy"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.find((entry) => entry.isIntersecting);
      if (!entering) { setPosition(null); return; }
      const heading = entering.target.querySelector("h2");
      if (!heading) return;
      const rect = heading.getBoundingClientRect();
      setPosition({ x: Math.min(window.innerWidth - 102, rect.right + 8), y: Math.max(92, rect.top - 60) });
    }, { rootMargin: "-12% 0px -54% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reducedMotion]);
  return (
    <span className={`scroll-pet ${position ? "is-visible" : ""}`} aria-hidden="true"
      style={{ transform: `translate3d(${position?.x ?? -100}px, ${position?.y ?? 0}px, 0)` }}>
      <Image src={sitePath(CAT_ASSET)} alt="" width={128} height={128} unoptimized />
    </span>
  );
}

function RealisticHeroVideo({
  reducedMotion,
  jacket,
}: {
  reducedMotion: boolean;
  jacket: Rgb;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef, true);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  // "pending" until the transparent WebGL cat has drawn; the raw film (which has
  // a studio backdrop baked in) is never shown.
  const [renderer, setRenderer] = useState<"pending" | "webgl" | "fallback">("pending");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!visible || userPaused || ((reducedMotion || saveData) && !manualPlay)) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
    return () => video.pause();
  }, [visible, reducedMotion, userPaused, manualPlay]);

  return (
    <div className="realistic-hero-media" data-renderer={renderer}>
      <div className="hero-cat-stage">
        {/* Transparent still of the poster frame, pre-rendered through the same
            keying used live: visible from the first paint and kept as the
            fallback when WebGL is unavailable. */}
        <Image
          className="hero-cat-still"
          src={sitePath("/film/mewmuze-cutout-green.webp")}
          alt=""
          aria-hidden="true"
          width={1280}
          height={720}
          priority
          unoptimized
        />
        <video
          ref={videoRef}
          className="realistic-hero-video"
          poster={sitePath("/film/mewmuze-intro-poster.webp")}
          src={sitePath("/film/mewmuze-intro.mp4")}
          muted playsInline loop preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="A realistic playful cat introducing MewMuze"
        />
        <HeroCatCanvas
          videoRef={videoRef}
          posterSrc={sitePath("/film/mewmuze-intro-poster.webp")}
          jacket={jacket}
          reducedMotion={reducedMotion}
          onRendererChange={setRenderer}
        />
      </div>
      <button className="hero-video-control" type="button" aria-label={playing ? "Pause cat video" : "Play cat video"} onClick={() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
          setManualPlay(true);
          setUserPaused(false);
          void video.play().catch(() => {});
        } else {
          setUserPaused(true);
          video.pause();
        }
      }}>{playing ? "Pause" : "Play"} <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span></button>
    </div>
  );
}

/** A few of the Paper chat's 37 personas, with the emoji its chat header shows. */
const chatPersonas = [
  ["💔", "Breakup Buddy"],
  ["🩺", "Health Guide"],
  ["😼", "Savage Bestie"],
  ["🫶", "Rant Buddy"],
  ["🌷", "Comfort Companion"],
  ["🚀", "Hype Cat"],
  ["🌙", "Night Owl"],
  ["💼", "Career Coach"],
] as const;

const chatPoints = [
  ["37 modes. One cat.", "Rant Buddy takes your side, Health Guide stays careful, Hype Cat gasses you up. She switches on her own. You just talk."],
  ["Your 2am overshare stays home.", "Chat runs on your PC by default. No account, no cloud chat log, no receipts."],
  ["Soft when it hurts. Savage when it's funny.", "She roasts what they did, never who you are, and drops the jokes the second it gets real."],
] as const;

/** The Paper app's persona chat: a rendered demo on the left, the pitch on the right. */
function ChatLab({ reducedMotion }: { reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reducedMotion) void video.play().catch(() => {});
    else video.pause();
  }, [visible, reducedMotion]);

  return (
    <section className="chat-lab section-pad" id="paper-preview" aria-labelledby="chat-lab-title">
      <div className="section-shell chat-lab-shell">
        {/* The glass pane is the bezel; the film sits on it as a sibling, so it is
            never remounted when liquid-glass-react loads. */}
        <div className="chat-lab-frame-wrap">
          <GlassSurface variant="panel" className="chat-lab-frame" />
          <video
            ref={videoRef}
            className="chat-lab-video"
            src={sitePath("/videos/mewmuze-chat-demo.mp4")}
            poster={sitePath("/videos/mewmuze-chat-demo-poster.webp")}
            muted
            playsInline
            loop
            preload="metadata"
            aria-label="Demo: someone tells MewMuze they just had a breakup, MewMuze switches to Breakup Buddy and replies gently"
          />
        </div>
        <div className="chat-lab-copy">
          <span className="liquid-kicker">INSIDE THE PAPER LAB · CHAT</span>
          <h2 id="chat-lab-title">
            Spill the tea.
            <br />
            <em>She already switched modes.</em>
          </h2>
          <p className="chat-lab-lead">
            Type &ldquo;I just had a breakup&rdquo; and she does not hit you with &ldquo;plenty of fish.&rdquo;
            MewMuze reads the vibe, picks the persona that actually fits, and answers like the friend
            who gets it. Main character support, zero cringe.
          </p>
          <ul className="chat-lab-personas" aria-label="Some of MewMuze's chat personas">
            {chatPersonas.map(([emoji, name]) => (
              <li key={name}>
                <span aria-hidden="true">{emoji}</span> {name}
              </li>
            ))}
            <li className="chat-lab-more">+ 29 more</li>
          </ul>
          <div className="chat-lab-points">
            {chatPoints.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="chat-lab-note">
            From the Paper build: chat, personas and voice <strong>come with MewMuze Pro</strong>.
            Illustrative conversation, not a live AI chat on this page.
          </p>
        </div>
      </div>
    </section>
  );
}

/** The feelings the film leans on, in its own glow colours. */
const emotionHighlights = [
  ["Savage", "#ff2fb9"],
  ["Angry", "#ff3d2e"],
  ["Rage", "#ff3d2e"],
  ["Sad", "#3b8dff"],
  ["Crying", "#3b8dff"],
  ["Adoring", "#ff6fcf"],
  ["Sleepy", "#9d5cff"],
] as const;

const emotionSync = [
  ["You type, she types.", "Start typing and a tiny keyboard comes out. Go too hard and she overheats with you."],
  ["You vibe, she vibes.", "Music plays, headphones go on, head starts bopping. No request needed."],
  ["You sing, she sings.", "The second an app is using your mic, she grabs hers. Takes a bow after."],
] as const;


/**
 * The nav glass shows what is behind it: while it floats over a dark section
 * (marked `data-nav-dark`) it switches to dark glass with light text
 * (emotion-lab.css), so the links stay readable.
 */
function useDarkNavTone() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const check = () => {
      frame = 0;
      const over = [...document.querySelectorAll<HTMLElement>("[data-nav-dark]")].some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 44 && rect.bottom >= 44;
      });
      if (over) root.dataset.navTone = "dark";
      else delete root.dataset.navTone;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      delete root.dataset.navTone;
    };
  }, []);
}

/** The Paper cat's emotion system: the copy on the left, every feeling on film to the right. */
function EmotionLab({ reducedMotion }: { reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reducedMotion) void video.play().catch(() => {});
    else video.pause();
  }, [visible, reducedMotion]);

  return (
    <section className="emotion-lab section-pad" id="feelings" data-nav-dark aria-labelledby="emotion-lab-title">
      <div className="section-shell emotion-lab-shell">
        <div className="emotion-lab-copy">
          <span className="liquid-kicker">INSIDE THE PAPER LAB · FEELINGS</span>
          <h2 id="emotion-lab-title">
            She reads the room.
            <br />
            <em>Then she shows up for it.</em>
          </h2>
          <p className="emotion-lab-lead">
            Sad? She goes soft and stays close instead of crying at you. Frustrated? She is annoyed
            with you at the situation, never at you. Hyped? She is bouncing too. 29 feelings, one tiny
            face, and she picks the one you actually need.
          </p>
          <ul className="emotion-lab-moods" aria-label="Some of MewMuze's 29 feelings">
            {emotionHighlights.map(([name, color]) => (
              <li key={name} style={{ "--mood": color } as CSSProperties}>
                {name}
              </li>
            ))}
            <li className="emotion-lab-more">+ 22 more</li>
          </ul>
          <div className="emotion-lab-sync">
            {emotionSync.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="emotion-lab-diary">
            <div className="emotion-lab-diary-copy">
              <h3>She keeps a diary. Of your story.</h3>
              <p>
                After a real conversation she writes it up as a short entry in your own voice, saved
                as plain Markdown files on your PC. Forget Chat never touches it. Only you delete an entry.
              </p>
            </div>
            <figure className="emotion-lab-entry" aria-label="Example diary entry">
              <figcaption>diary/2026-09-14_23-41_x7k2.md</figcaption>
              <strong># 14 September 2026</strong>
              <small>11:41 PM</small>
              <span>&ldquo;The night I finally said it&rdquo;</span>
              <p>I told MewMuze about the breakup. She did not try to fix it, she just let me talk, and that helped more than advice would have.</p>
            </figure>
          </div>
          <p className="emotion-lab-note">
            From the Paper build: the emotion engine and Diary <strong>come with MewMuze Pro</strong>.
            The Cyberpunk Cat costume comes with Pro too. Film rendered by the Paper app&rsquo;s own sprite renderer.
          </p>
        </div>
        <div className="emotion-lab-film">
          <video
            ref={videoRef}
            className="emotion-lab-video"
            src={sitePath("/videos/mewmuze-emotions.mp4")}
            poster={sitePath("/videos/mewmuze-emotions-poster.webp")}
            muted
            playsInline
            loop
            preload="metadata"
            aria-label="MewMuze in the Cyberpunk Cat costume and bandana cycling through all 29 feelings, including savage, angry, rage, sad and crying, then typing, dancing to music and singing into a mic"
          />
        </div>
      </div>
    </section>
  );
}

/** Pro Quick Tools, in plain words. Every row is something the shipped panel really does. */
const quickToolCards = [
  {
    id: "pdf",
    icon: "PDF",
    title: "PDF Tools",
    sub: "Images to PDF, export, merge, split",
    rows: [
      ["Pics → PDF", "Photos in, one clean PDF out. Assignment? Submitted."],
      ["PDF → Pics", "Any page to PNG or JPG, up to 300 dpi. Crisp, not potato."],
      ["Merge", "Five PDFs? Now it's one."],
      ["Split", "Keep pages 1, 3 and 5-7. Or one file per page."],
    ],
  },
  {
    id: "sheets",
    icon: "XLSX",
    title: "Spreadsheet Tools",
    sub: "CSV and XLSX, merge, split workbook",
    rows: [
      ["CSV ↔ XLSX", "CSV to Excel and back. Preview first, zero cursed columns."],
      ["Merge sheets", "Many sheets, one file. Columns match up by name."],
      ["Split workbook", "Twelve tabs? Twelve tidy files, Excel or CSV."],
    ],
  },
] as const;

/** Work Mode's PDF and spreadsheet tools: the jobs play as a film behind, the plain-words version sits in front. */
function QuickToolsLab({ reducedMotion }: { reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reducedMotion) void video.play().catch(() => {});
    else video.pause();
  }, [visible, reducedMotion]);

  return (
    <section className="tools-lab section-pad" id="quick-tools" aria-labelledby="tools-lab-title">
      <video
        ref={videoRef}
        className="tools-lab-film"
        src={sitePath("/videos/mewmuze-quick-tools.mp4")}
        poster={sitePath("/videos/mewmuze-quick-tools-poster.webp")}
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
      />
      <div className="tools-lab-overlay" aria-hidden="true" />
      <div className="section-shell tools-lab-shell">
        <header className="tools-lab-head">
          <span className="liquid-kicker">WORK MODE · QUICK TOOLS · PRO</span>
          <h2 id="tools-lab-title">
            Stop feeding your files to sketchy sites.
            <br />
            <em className="tools-lab-sub">She does PDFs and spreadsheets. Offline.</em>
          </h2>
          <p>
            Fourteen fake download buttons and your file is gone who knows where? Nah. MewMuze does it
            right on your PC. No upload, no account, no ads.
          </p>
        </header>
        <div className="tools-lab-cards">
          {quickToolCards.map((card) => (
            <article className={`tools-lab-card tools-lab-card-${card.id}`} key={card.id}>
              <div className="tools-lab-card-head">
                <span className="tools-lab-icon" aria-hidden="true">{card.icon}</span>
                <div>
                  <h3>{card.title}</h3>
                  <small>{card.sub}</small>
                </div>
              </div>
              <dl>
                {card.rows.map(([name, copy]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{copy}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <ul className="tools-lab-stats" aria-label="What Quick Tools never needs">
          <li><strong>0</strong> uploads</li>
          <li><strong>0</strong> accounts</li>
          <li><strong>0</strong> fake download buttons</li>
        </ul>
        <p className="tools-lab-note">Included with MewMuze Pro. Your files are processed on your own computer and never uploaded anywhere.</p>
      </div>
    </section>
  );
}

/** A short word about the wardrobe; the costumes themselves live in the store. */
function CostumeTeaser() {
  return (
    <section className="costume-lab section-pad" id="costumes" data-nav-dark aria-labelledby="costume-lab-title">
      <div className="section-shell costume-lab-shell">
        <header className="costume-lab-head">
          <span className="liquid-kicker">BUILT-IN COSTUMES · INCLUDED WITH PRO</span>
          <h2 id="costume-lab-title">
            Three fits. <em>Same menace.</em>
          </h2>
          <p>
            Corporate Cat, Cyberpunk Cat and Bat Cat ship with Pro. Every costume is drawn live on her
            body, so it moves with each pose, paw and mood, and every one comes in colours you pick.
          </p>
          <a className="costume-lab-cta skeuo-button skeuo-button-primary" href={sitePath("/store/")}>
            See the wardrobe <span aria-hidden="true">→</span>
          </a>
        </header>
      </div>
    </section>
  );
}

const carePoints = [
  ["A check-in in one tap", "Five moods, an optional note, nothing graded. A low day gets a paw heart, not a lecture."],
  ["“I need a minute”", "Overwhelmed, angry, can’t focus, can’t sleep, lonely, or just need to breathe. Pick lonely and she simply sits with you."],
  ["Breathe with her", "Relax (in for four, out for six) or Box breathing, 30 seconds to 5 minutes. She breathes along with you."],
  ["A friendship that only grows", "Little wins, three small quests a day and reflections earn XP and keepsakes. Miss a day and nothing is lost. No streaks."],
] as const;

/** The Paper app's Care panel: a 2am check-in, a minute, a breath, on film beside the pitch. */
function CareLab({ reducedMotion }: { reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reducedMotion) void video.play().catch(() => {});
    else video.pause();
  }, [visible, reducedMotion]);

  return (
    <section className="care-lab section-pad" id="care" aria-labelledby="care-lab-title">
      <div className="section-shell care-lab-shell">
        <div className="care-lab-film">
          <video
            ref={videoRef}
            src={sitePath("/videos/mewmuze-care.mp4")}
            poster={sitePath("/videos/mewmuze-care-poster.webp")}
            muted
            playsInline
            loop
            preload="metadata"
            aria-label="Demo: a late night check-in in MewMuze's Care panel. Low is picked and the cat answers with a paw heart, I feel lonely has her sit with you, then a one minute breathing session starts"
          />
        </div>
        <div className="care-lab-copy">
          <span className="liquid-kicker">INSIDE THE PAPER LAB · CARE</span>
          <h2 id="care-lab-title">
            Rough night?
            <br />
            <em>She stays up with you.</em>
          </h2>
          <p className="care-lab-lead">
            Care is a quiet corner for checking in with yourself. Tell her how you are, take a tiny win, breathe for a
            minute, or just say you need one. She answers the way a friend would, not the way an app would.
          </p>
          <ul className="care-lab-points">
            {carePoints.map(([title, copy]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{copy}</span>
              </li>
            ))}
          </ul>
          <p className="care-lab-note">
            From the Paper build: Care <strong>comes with MewMuze Pro</strong>. It is not a
            health product or a therapist: nothing in it scores, diagnoses or judges, and every number stays on your
            computer. Film rebuilt from the app&rsquo;s own Care panel.
          </p>
        </div>
      </div>
    </section>
  );
}

const taskPoints = [
  ["Subtasks, four levels deep", "Big task, small steps. Tick the steps and the parent ticks itself."],
  ["A one-day timeline", "Every timed task on one strip, with a line for right now."],
  ["Overdue gets called out", "Missed the 9:30? She noticed. Politely. In red."],
] as const;

/** The Paper app's Tasks panel: the list, then Insights, on film beside the pitch. */
function TasksLab({ reducedMotion }: { reducedMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useVisibleMotion(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reducedMotion) void video.play().catch(() => {});
    else video.pause();
  }, [visible, reducedMotion]);

  return (
    <section className="tasks-lab section-pad" id="tasks" aria-labelledby="tasks-lab-title">
      <div className="section-shell tasks-lab-shell">
        <div className="tasks-lab-film">
          <video
            ref={videoRef}
            src={sitePath("/videos/mewmuze-tasks.mp4")}
            poster={sitePath("/videos/mewmuze-tasks-poster.webp")}
            muted
            playsInline
            loop
            preload="metadata"
            aria-label="Demo: three tasks are typed into MewMuze's Tasks panel, two are ticked off, then Insights shows progress, time estimates, overdue tasks and a one-day timeline"
          />
        </div>
        <div className="tasks-lab-copy">
          <span className="liquid-kicker">INSIDE THE PAPER LAB · TASKS</span>
          <h2 id="tasks-lab-title">
            Make the list.
            <br />
            <em>She brings the receipts.</em>
          </h2>
          <p className="tasks-lab-lead">
            Type a task, hit Enter, done. Nest subtasks, give things a time. Then tap Insights: what&rsquo;s done,
            what&rsquo;s left, how long it really takes, and the stuff you&rsquo;re pretending isn&rsquo;t overdue.
          </p>
          <ul className="tasks-lab-points">
            {taskPoints.map(([title, copy]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{copy}</span>
              </li>
            ))}
          </ul>
          <p className="tasks-lab-note">
            From the Paper build: Tasks <strong>comes with MewMuze Pro</strong>. Illustrative demo with made-up tasks.
          </p>
        </div>
      </div>
    </section>
  );
}

type RollTag = "free" | "pro" | "paper";
const rollTags: Record<RollTag, string> = { free: "FREE + PRO", pro: "PRO", paper: "PAPER PREVIEW" };

/** Everything else, one line each. Tags follow the edition table below. */
const featureRoll: { name: string; line: string; tag: RollTag; color: string }[] = [
  { name: "Time & Calc", line: "Tip splits, unit swaps, what time it is in Tokyo. No new tab, no Googling, no shame.", tag: "free", color: "#9dff4a" },
  { name: "Focus Mode", line: "Start the timer and she stops chasing your cursor. Quiet cheering only. Lock in.", tag: "free", color: "#22e0ff" },
  { name: "Pomodoro", line: "25 on, 5 off, repeat. Your attention span, but make it structured.", tag: "free", color: "#ff6fcf" },
  { name: "Water & stretch", line: "Drink water. Unclench your jaw. Stand up. She is not asking.", tag: "free", color: "#ffd166" },
  { name: "Reminders", line: "Write your own, get warned before it's due, snooze it like a pro. She remembers so you don't have to.", tag: "free", color: "#b18cff" },
  { name: "Gmail pings", line: "New mail lands as a tiny card: who sent it and the subject. She never reads the email. Unlike your coworkers.", tag: "pro", color: "#9dff4a" },
  { name: "Meeting warnings", line: "Calendar says 10 minutes? She taps the glass. Snooze for five, then no excuses.", tag: "pro", color: "#22e0ff" },
  { name: "Clipboard helper", line: "Copy something and she offers to help with it. Only what you copied, nothing sneaky.", tag: "pro", color: "#ff6fcf" },
  { name: "Voice to text", line: "Talk, she types. Push-to-talk dictation, transcribed right on your PC, raw and clean both kept.", tag: "paper", color: "#ffd166" },
  { name: "Peek Mode", line: "Presenting? She ducks out of frame and comes back when the coast is clear.", tag: "free", color: "#b18cff" },
  { name: "Music vibes", line: "Your playlist starts, she starts bopping. Knows it's playing, never snoops on the song.", tag: "free", color: "#9dff4a" },
  { name: "Window physics", line: "Sits on your windows, clings to the edges, falls with full drama.", tag: "free", color: "#22e0ff" },
];

/** The last big section: every other feature, rolling up one line at a time. */
function FeatureRoll() {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useVisibleMotion(sectionRef);
  const items = (hidden: boolean) =>
    featureRoll.map((f) => (
      <li key={`${f.name}-${hidden}`} className="feature-roll-item" aria-hidden={hidden || undefined} style={{ "--c": f.color } as CSSProperties}>
        <header>
          <h3>{f.name}</h3>
          <span className={`feature-roll-tag ${f.tag}`}>{rollTags[f.tag]}</span>
        </header>
        <p>{f.line}</p>
      </li>
    ));

  return (
    <section ref={sectionRef} className={`feature-roll section-pad${visible ? " is-playing" : ""}`} id="everything" data-nav-dark aria-labelledby="feature-roll-title">
      <div className="section-shell feature-roll-shell">
        <div className="feature-roll-head">
          <span className="liquid-kicker">AND THE REST OF HER CV</span>
          <h2 id="feature-roll-title">
            She has range.
            <br />
            <em>Your excuses don&rsquo;t.</em>
          </h2>
          <p>All the small stuff that quietly saves your day, rolling past. Hover to make it stop.</p>
          <ul className="feature-roll-legend" aria-label="Where each feature is available">
            {(Object.keys(rollTags) as RollTag[]).map((tag) => (
              <li key={tag} className={`feature-roll-tag ${tag}`}>{rollTags[tag]}</li>
            ))}
          </ul>
        </div>
        <div className="feature-roll-window">
          <ul className="feature-roll-track">
            {items(false)}
            {items(true)}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);
  // Starts true: the landing hero used to lock scrolling until a button was
  // pressed. Every lock/force-scroll/gate below only fires when this is
  // false, so starting unlocked removes the lock entirely without touching
  // the effect, the buttons, or the one-time "assemble" animation they used
  // to trigger - it now just plays once on mount instead.
  const [experienceUnlocked, setExperienceUnlocked] = useState(true);
  const [supportDeveloper, setSupportDeveloper] = useState(false);
  const supportSelected = supportDeveloper && commerce.supporterConfigured;
  // Dollars on the server, rupees after mount for Indian visitors. The server
  // snapshot is what makes one static file safe to serve worldwide.
  const rupees = useSyncExternalStore(noSubscribe, prefersRupees, serverPrefersRupees);
  const priceLabel = priceLabelFor(rupees, supportSelected);
  const heroRef = useRef<HTMLElement>(null);
  const heroActive = useVisibleMotion(heroRef, true);
  useDarkNavTone();
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreferences = () => {
      setReducedMotion(motionQuery.matches);
    };
    syncPreferences();
    motionQuery.addEventListener("change", syncPreferences);
    return () => {
      motionQuery.removeEventListener("change", syncPreferences);
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
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [reducedMotion]);

  const unlockAndScroll = (targetId: "#paper-preview" | "#pricing") => {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }}
      />
      <ScrollPet reducedMotion={reducedMotion} />
      <a
        className="skip-link"
        href="#paper-preview"
        onClick={(event) => {
          if (!experienceUnlocked) {
            event.preventDefault();
            unlockAndScroll("#paper-preview");
          }
        }}
      >
        Skip to the content
      </a>

      <header className="site-navigation">
        <SiteNav />
      </header>

      <section
        ref={heroRef}
        id="companion"
        className="hero cinematic-hero"
        data-motion-paused={!heroActive || reducedMotion}
        aria-labelledby="hero-title"
      >
        <div className="hero-environment" aria-hidden="true">
          <span className="hero-light hero-light-a" />
          <span className="hero-light hero-light-b" />
          <span className="hero-light hero-light-c" />
          <span className="hero-light hero-light-d" />
          <span className="hero-pattern" />
          <span className="hero-grain" />
        </div>
        <p className="privacy-note">
          <span aria-hidden="true">●</span> Free to keep · Windows 10/11 · macOS coming soon · Local-first by design
        </p>
        <RealisticHeroVideo reducedMotion={reducedMotion} jacket={HERO_JACKET} />

        <div className="hero-copy">
          <Eyebrow>A PERSONAL DESKTOP PET FOR WINDOWS AND MACOS</Eyebrow>
          <h1 id="hero-title">Your desktop, a little more alive.</h1>
          <p className="hero-support">
            A little company. A little help. A lot of personality.
            Meet the companion that makes your desktop feel like home.
          </p>
          <div className="hero-actions">
            <div className="hero-primary-actions">
              <GlassSurface className="hero-glass-free"><DownloadButton className="hero-glass-link" href={commerce.freeDownloadUrl} edition="free">Download Free <span aria-hidden="true">↓</span></DownloadButton></GlassSurface>
              <GlassSurface className="hero-glass-pro"><button className="hero-glass-link" type="button" onClick={() => unlockAndScroll("#pricing")}>{`Get MewMuze Pro · ${priceLabel}`}</button></GlassSurface>
              <GlassSurface className="hero-glass-explore"><button className="hero-glass-link" type="button" onClick={() => unlockAndScroll("#paper-preview")}>Explore Now <span aria-hidden="true">↓</span></button></GlassSurface>
            </div>
          </div>
        </div>

      </section>

      {/* The page tells one day, in order: the hour nobody is around, she picks
          up, she feels it back, she looks after you, she learns you, here is a whole day of that,
          then the work she saves you, how she looks, and the receipts. The
          catalogue sections stay where they were, at the end. */}
      <ColdOpen />
      <ChatLab reducedMotion={reducedMotion} />
      <EmotionLab reducedMotion={reducedMotion} />
      <CareLab reducedMotion={reducedMotion} />
      <AdaptsLab />
      <DayWithHer />
      <QuickToolsLab reducedMotion={reducedMotion} />
      <TasksLab reducedMotion={reducedMotion} />
      <CostumeTeaser />
      <Receipts />
      <FeatureRoll />

      <section className="feature-directory section-shell section-pad" id="directory" data-reveal>
        <div className="section-heading">
          <div>
            <Eyebrow>THE COMPLETE FEATURE DIRECTORY</Eyebrow>
            <h2>
              Everything your pet can do.
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
                <small>MEWMUZE PRO · WINDOWS, MACOS SOON</small>
                <strong>MewMuze Pro</strong>
              </span>
            </div>
            <div className="pricing-price">
              <small>ONE-TIME PRICE</small>
              <strong id="pricing-title">{priceLabel}</strong>
              <span>Roughly two burgers. Hers lasts longer.</span>
            </div>
            <ul>
              <li>A desktop pet who actually shows up</li>
              <li>Animations drawn frame by frame, not looped</li>
              <li>Focus timers she sits through with you</li>
              <li>PDF and spreadsheet tools, offline</li>
              <li>Clipboard assistant that remembers so you do not</li>
              <li>Build her: body, coat, colours, costumes</li>
              <li>Nothing leaves your machine. Nothing.</li>
              <li>Every future update and costume, free</li>
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
                  <strong>Throw in $1 for the developer</strong>
                  <small>
                    One person builds MewMuze. This is the coffee behind the next update.
                    Entirely optional, zero guilt.
                  </small>
                </span>
              </label>
            )}
            {commerce.configured ? (
              <a
                className="skeuo-button skeuo-button-primary pricing-gate"
                href={checkoutUrlFor(supportSelected)}
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
                ? "Test mode uses Dodo's sandbox: no real charge is made. Dodo confirms the exact amount before you pay."
                : "Dodo confirms the exact amount and currency before you pay."}
            </p>
          </div>
          <div className="pricing-copy">
            <Eyebrow>ONE PET. ONE PRICE. ONCE.</Eyebrow>
            <h2>
              Cheaper than the app
              <br />
              <em>you forgot you subscribed to.</em>
            </h2>
            <p>
              You have paid more than this for a lunch you cannot remember. This one
              keeps showing up on your desktop, every day, for as long as you own the
              computer. Pay once, then genuinely never think about it again.
            </p>
            <ul className="pricing-promises">
              <li>
                <strong>Nothing to cancel at 2am</strong>
                <span>There is no subscription to forget about, because there is no subscription.</span>
              </li>
              <li>
                <strong>Updates are not a new tier</strong>
                <span>New features, new animations and new costumes land for free. No Plus, no Max, no Ultra.</span>
              </li>
              <li>
                <strong>The wardrobe keeps growing</strong>
                <span>Costumes added after you buy are yours too. You never buy your pet twice.</span>
              </li>
            </ul>
            <p className="pricing-footnote">
              Secure checkout, tax and licence delivery are handled by Dodo Payments. Windows 10 and
              11 today, macOS coming soon, and your licence covers both.
            </p>
          </div>
        </div>
      </section>

      <ClosingBeat />

      <footer className="site-footer">
        <div className="section-shell">
          <a href="#top" aria-label="Back to the top">
            <SiteBrand />
          </a>
          <p>Personal desktop pet for Windows, with macOS coming soon. Local-first by design.</p>
          <nav aria-label="Footer navigation">
            <a href="#directory">Features</a>
            <a href="#costumes">Looks</a>
            <a href="#pricing">Pricing</a>
            <a href={sitePath("/store/")}>Store</a>
            <a href={sitePath("/support/")}>Purchase help</a>
          </nav>
          <span>© 2026 MewMuze</span>
        </div>
      </footer>
    </main>
  );
}
