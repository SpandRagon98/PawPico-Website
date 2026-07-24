"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicAsset = (path: string) => `${publicBasePath}${path}`;

type Film = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  video: string;
  accent: string;
  signals: string[];
  facts: string[];
};

const priorityFilms: Film[] = [
  {
    id: "work",
    eyebrow: "01 / Work mode",
    title: "A tiny operator with real tools.",
    copy: "A pixel lightning strike parks PawPico at a laptop in sunglasses. The console opens beside the cat and turns image and PDF conversion into a local desktop ritual.",
    video: "/videos/work-mode.mp4",
    accent: "amber",
    signals: ["parked pose", "local conversion", "smart placement"],
    facts: [
      "JPG or PNG to PDF, including multi-image PDFs in the order selected",
      "PDF to PNG or JPG at 96, 150, or 300 DPI",
      "Quick Tools avoids the cat and the Windows taskbar whenever space allows",
    ],
  },
  {
    id: "gmail",
    eyebrow: "02 / Gmail connector",
    title: "New mail, delivered by cat.",
    copy: "Connect with a Gmail address and Google app password. PawPico checks the inbox once per minute, then waves and surfaces only the newest sender and subject in its own notebook notice.",
    video: "/videos/gmail-connector.mp4",
    accent: "green",
    signals: ["60 s poll", "IMAP over TLS", "body never read"],
    facts: [
      "The first successful check establishes a quiet baseline—no notification burst",
      "Uses a revocable 16-character Google app password instead of an account login",
      "Credentials stay in the app's local settings and are passed only to Gmail",
    ],
  },
  {
    id: "calendar",
    eyebrow: "03 / Google Calendar",
    title: "Meetings arrive with a gentle warning.",
    copy: "Paste a private Google Calendar iCal address and choose the warning window. PawPico turns upcoming timed events into early notices, then a more urgent starting-now reaction.",
    video: "/videos/calendar-connector.mp4",
    accent: "sage",
    signals: ["5 min sync", "0–120 min warning", "snooze"],
    facts: [
      "Warn notices appear light green; starting-now notices switch to the due state",
      "Due events outrank early warnings and remain actionable for a short grace period",
      "The feed is parsed locally; all-day events are intentionally excluded from timed alarms",
    ],
  },
  {
    id: "notices",
    eyebrow: "04 / Smart notifications",
    title: "Reminders that feel like company.",
    copy: "PawPico uses one compact, typewriter-style notice system for one-off appointments, interval reminders, work-rest checks, Gmail, Calendar, motivation, and session milestones.",
    video: "/videos/smart-notifications.mp4",
    accent: "coral",
    signals: ["warn + due", "5 min snooze", "mark done"],
    facts: [
      "Set a title, date, time, and optional 1, 5, 10, or 15 minute early warning",
      "Stretch, water, custom, and active-use work-rest reminders have matching cat reactions",
      "Notices stay above the cat, avoid full-screen work, and never become Windows pop-ups",
    ],
  },
  {
    id: "appearance",
    eyebrow: "05 / Appearance studio",
    title: "Anatomy, color, coat, character.",
    copy: "The live studio changes real proportions before it applies color. Pick one of five bodies, then tune fur, eyes, inner ears, markings, size, accessories, and calendar-driven costumes.",
    video: "/videos/customization-studio.mp4",
    accent: "rose",
    signals: ["5 breeds", "7 patterns", "12 accessories"],
    facts: [
      "Classic, Chonk, Fluffy, Siamese, and Kitten have distinct silhouettes",
      "Fur, iris, and inner-ear colors update independently in the live preview",
      "Everyday accessories and seasonal costumes can be automatic or chosen manually",
    ],
  },
];

const featureGroups = [
  {
    id: "work",
    icon: "⚡",
    title: "Work mode & Quick Tools",
    label: "Flagship utility",
    video: "/videos/work-mode.mp4",
    lead: "The cat stops roaming, suits up at the flash peak, and operates a real local conversion panel.",
    items: [
      "Open or exit from the cat menu, tray menu, or the panel close button",
      "Lightning transition swaps the pose at the brightest moment",
      "Front-facing sunglasses-and-laptop loop outranks roaming and full-screen peek",
      "Cursor chasing is suppressed while eye tracking remains alive",
      "Panel tries right, left, above, then below and stays in the monitor work area",
      "JPG and PNG to PDF, including multiple images in selected order",
      "JPEG pages are embedded without re-encoding when possible",
      "PDF to PNG or JPG at 96, 150, or 300 DPI",
      "Every conversion runs locally; missing PDF rendering support degrades clearly",
      "DOC/DOCX conversion is honestly marked coming soon",
    ],
  },
  {
    id: "gmail",
    icon: "✉",
    title: "Gmail connector",
    label: "Opt-in connection",
    video: "/videos/gmail-connector.mp4",
    lead: "A small, revocable connection that turns fresh inbox arrivals into friendly cat notices.",
    items: [
      "Connect with a Gmail address and 16-character Google app password",
      "Secure IMAP-over-TLS connection directly to Gmail",
      "Inbox polling once per minute with explicit network timeouts",
      "Reads unread count plus only the newest message envelope",
      "Notification includes sender display name or address and subject",
      "Never reads or stores the email body",
      "First poll creates a baseline so existing mail never floods the screen",
      "Notification can be switched off without disconnecting",
      "PawPico waves and optionally meows when a genuinely new UID appears",
    ],
  },
  {
    id: "calendar",
    icon: "▦",
    title: "Google Calendar connector",
    label: "Opt-in connection",
    video: "/videos/calendar-connector.mp4",
    lead: "A private iCal feed becomes a quiet meeting concierge without OAuth or a separate sign-in window.",
    items: [
      "Connect with the Secret address in iCal format from Google Calendar",
      "HTTPS-only feed with a five-minute refresh interval",
      "User-selectable early warning from 0 to 120 minutes",
      "Upcoming timed events are resolved against the computer's local time zone",
      "Early warning shows a green notice; event start switches to the due style",
      "Due events outrank other calendar warnings",
      "Five-minute snooze is available from the notice",
      "All-day events are visible to the parser but intentionally skip timed alarms",
      "Only events near the current time are retained, capped at forty",
    ],
  },
  {
    id: "notices",
    icon: "◉",
    title: "Notifications & reminders",
    label: "Unified notice system",
    video: "/videos/smart-notifications.mp4",
    lead: "One restrained notebook language covers reminders, connected services, and encouragement.",
    items: [
      "One-off reminders with title, local date, time, and optional early warning",
      "Warn and due phases use distinct color cues and matching cat urgency",
      "Five-minute snooze and Mark Done for scheduled reminders",
      "Configurable stretch and water intervals",
      "Unlimited custom interval reminders with user-written messages",
      "Work-rest checks count active computer use—not wall-clock time",
      "Active-use tracking pauses while away, paused, hidden, or full-screen",
      "Pinned note rides beside the cat without fighting active notices",
      "Optional local display name personalizes messages",
      "Typewriter reveal, single-line layout, and collision-aware placement above PawPico",
    ],
  },
  {
    id: "appearance",
    icon: "◈",
    title: "Appearance & wardrobe",
    label: "Live studio",
    video: "/videos/customization-studio.mp4",
    lead: "Five body plans create genuinely different cats before the coat and wardrobe are applied.",
    items: [
      "Classic: balanced house-cat proportions",
      "Chonk: round torso, short legs, broad cheeks, and a thicker tail",
      "Fluffy: ear tufts, cheek floof, neck ruff, and plume tail",
      "Siamese: slender body, taller ears, finer tail, and dark points",
      "Kitten: smallest torso with the largest head and eyes",
      "Small, medium, and large display sizes",
      "Independent fur, iris, and inner-ear colors",
      "Solid, tuxedo, tabby, socks, spotted, calico, and bicolour patterns",
      "Sunglasses, glasses, headphones, bandana, watch, hat, and cap",
      "Santa hat, witch hat, party hat, flower crown, and winter scarf",
      "Optional calendar wardrobe for Halloween, December, New Year, winter, and spring",
    ],
  },
  {
    id: "movement",
    icon: "MV",
    title: "Movement & desktop physics",
    label: "28 motion states",
    video: "/videos/desktop-physics.mp4",
    lead: "Windows become ledges, monitor work areas become floors, and motion follows actual physical state.",
    items: [
      "Walk, stalk, run, and sprint with distinct multi-frame gaits",
      "Turn around, turn left, turn right, look up, and look down",
      "Jump, small hop, vertical jump, long jump, fall, and four landing outcomes",
      "Walks and sits along taskbar and window tops",
      "Balances or peeks at unsafe ledge ends",
      "Hops between nearby windows and explores vertically",
      "Clings to side edges and climbs up or down",
      "Hangs by two paws, slips to one, pulls up, or loses grip",
      "Rides moving windows and falls naturally when support disappears",
      "Multi-monitor geometry, mixed-DPI scaling, taskbar awareness, and safe recovery",
    ],
  },
  {
    id: "touch",
    icon: "✦",
    title: "Cursor, petting & mochi",
    label: "Tactile interaction",
    video: "/videos/touch-and-mochi.mp4",
    lead: "The pointer is a gaze target, toy, petting hand, and a welded scruff anchor for soft-body dragging.",
    items: [
      "Glossy pupils lead the cursor while the head follows with restrained lag",
      "Watches, approaches, chases, pounces, swats, catches, and tail-chases",
      "Gentle back-and-forth strokes trigger petting; plain hover only gets a look",
      "Petting progresses through half-closed eyes, loafing, purrs, and hearts",
      "Quick clicks are pokes; repeated grabbing gradually annoys the cat",
      "Dragging begins only after movement or a short hold",
      "The scruff stays welded to the cursor while the body stretches and narrows",
      "Lower mesh points trail farther than the head without folding or gapping",
      "Release carries a gentle toss, overshoots, wobbles, and settles",
      "Drop on, below, or beside a title bar to stand, hang, or cling",
    ],
  },
  {
    id: "context",
    icon: "⌘",
    title: "Context-aware companion",
    label: "Local Windows signals",
    video: "/videos/context-companion.mp4",
    lead: "Broad app category and activity—not text or screen content—select a useful companion pose.",
    items: [
      "Writing apps open a notebook and trigger animated note-taking",
      "Steady typing attacks a tiny keyboard with alternating paws",
      "Fast typing blushes and steams; a sustained streak escalates to panic",
      "Scroll direction makes PawPico look up or down and unroll a paper strip",
      "Sustained slow browser scrolling opens a book",
      "Coding apps and terminals automatically bring out glasses",
      "Foreground context uses only the executable basename",
      "Keyboard reaction consumes aggregate key counts, never key identities",
      "Explain-this-screen reports only app name, broad category, and media state",
      "A strict priority system prevents competing context loops from fighting",
    ],
  },
  {
    id: "music",
    icon: "♫",
    title: "Music, microphone & sound",
    label: "Performance mode",
    video: "/videos/music-and-singing.mp4",
    lead: "System playback becomes a headphone dance; microphone activity becomes a tiny stage performance.",
    items: [
      "Windows media playback state automatically swaps in headphones",
      "Dance loop smiles, bops, raises a paw, and floats music notes",
      "No artist, title, album art, or other track metadata is read",
      "Detects only whether another application is actively capturing a microphone",
      "No microphone stream is opened, recorded, or transcribed",
      "Active capture starts a microphone singing animation",
      "When capture ends, PawPico performs a small bow",
      "Optional synthesized meow, purr, landing tap, and sleep tone",
      "Sounds are off and muted by default, with rate limits for calm background use",
    ],
  },
  {
    id: "personality",
    icon: "☺",
    title: "Personality, moods & rest",
    label: "A real inner life",
    video: "/videos/rest-and-emotion.mp4",
    lead: "Energy, curiosity, interaction history, and weighted randomness create calm rituals instead of a robotic loop.",
    items: [
      "Core moods: calm, curious, playful, sleepy, and annoyed",
      "Eleven eye states plus coordinated pupils, ears, mouth, tail, blush, steam, hearts, notes, and Zs",
      "Mostly settles front-facing and still, with roaming used as punctuation",
      "Slow blink, tail flick, clean paw, wash face, groom, scratch, and look around",
      "Random cute nod with smile, closed eyes, blush, and tail flick",
      "Full-body stretch and self-play such as paw swipes and tail chasing",
      "Energy drains during exertion and recovers while sitting or sleeping",
      "A still cursor triggers a full open-mouth yawn before curled sleep",
      "Nearby cursor movement—not a merely parked pointer—wakes the cat",
      "Long periods without affection can surface a low-priority sad expression",
    ],
  },
  {
    id: "focus",
    icon: "◎",
    title: "Focus, breaks & Pomodoro",
    label: "Gentle productivity",
    video: "/videos/focus-and-agent.mp4",
    lead: "Two timer systems cover quick focus sessions and configurable Pomodoro cycles without making the cat frantic.",
    items: [
      "Right-click Focus mode counts upward in a steady green timer chip",
      "Focus parks PawPico front-facing and suppresses cursor chasing",
      "A small happy nod or cheer appears every twenty to thirty-five seconds",
      "Break picker offers 5, 10, 15, 20, or 30 minutes",
      "Break timer counts down with a green-to-amber-to-red progress ramp",
      "Overrun clearly changes the chip to BREAK'S OVER",
      "Configurable Pomodoro focus, short break, long break, and cycle count",
      "Pomodoro supports start, pause, resume, skip, reset, and phase completion",
      "Focus completion raises a celebratory placard and a break invitation",
      "Motivation can appear after sustained active work with glasses and rotating notes",
    ],
  },
  {
    id: "agent",
    icon: "◆",
    title: "Local AI-agent companion",
    label: "Explicit file integration",
    video: "/videos/focus-and-agent.mp4",
    lead: "Point PawPico at one JSON status file written by a local tool; the cat never scans beyond that exact path.",
    items: [
      "Idle returns control to normal behavior",
      "Thinking raises a paw and looks upward",
      "Running kneads like a tiny keyboard operator",
      "Waiting watches attentively",
      "Success celebrates, optionally meows, and announces completion",
      "Failed looks confused and surfaces an error note",
      "Attention triggers a startled reaction",
      "The integration is off until an absolute local path is explicitly supplied",
    ],
  },
  {
    id: "system",
    icon: "▣",
    title: "Windows behavior & controls",
    label: "Quiet infrastructure",
    video: "/pawpico-idle-reel.mp4",
    lead: "A lightweight Tauri overlay behaves like desktop infrastructure while the cat remains full of personality.",
    items: [
      "Transparent, borderless, always-on-top virtual-desktop overlay with no taskbar entry",
      "Dynamic click-through everywhere except PawPico, its drag, menus, and panels",
      "Automatic or manual corner peek during full-screen apps and presentations",
      "Cat Off waves goodbye, fades away, and remains available from the tray",
      "Tray actions: on/off, pause, pet, call, sleep, work, chase, sound, temperament, size, startup, reset, and settings",
      "Calm, balanced, and playful activity profiles",
      "Start with Windows, reset position, reset settings, and live appearance preview",
      "Adaptive frame rate and detail: lively during interaction, quiet during rest, near-zero when hidden",
      "Dark or warm-light settings panels without changing the cat's chosen coat",
      "Automatic or manual update checks with verified install flow",
      "14-day full-feature trial, offline license verification, then a charming free core pet",
    ],
  },
];

const animationLedger = [
  ["Movement · 28", ["idle", "side idle", "back idle", "walk", "stalk", "run", "sprint", "turn around", "turn left", "turn right", "look up", "look down", "jump", "small hop", "vertical jump", "long jump", "fall", "land", "soft land", "hard land", "climb", "climb up", "climb down", "step down", "balance", "hang—two paws", "hang—one paw", "pull up"]],
  ["Rest & rituals · 15", ["sit", "side sit", "cute nod", "lie down", "sleep", "wake up", "stretch", "yawn", "blink", "tail flick", "clean paw", "clean face", "scratch", "groom", "look around"]],
  ["Cursor play · 18", ["watch", "approach", "chase", "pounce", "swat", "paw swipe", "catch", "hold", "dragged by cursor", "cursor grab", "cursor swing", "lose grip", "land safe", "confused", "startled", "tired", "tail chase", "peek"]],
  ["Touch & emotion · 10", ["petted", "petted—eyes closed", "purr", "picked up", "dangle", "dragged—surprised", "placed down", "shake", "annoyed", "happy"]],
  ["Work & context · 16", ["knead", "overheat", "think", "celebrate", "wave", "write notes", "type keys", "sing", "bow", "Quick Tools", "panic", "sad", "placard", "read book", "dance bop", "embarrassed"]],
];

const filters = [
  ["all", "All systems"],
  ["connected", "Connected"],
  ["desktop", "Desktop"],
  ["companion", "Companion"],
  ["productivity", "Productivity"],
  ["personalize", "Personalize"],
] as const;

const filterMap: Record<string, string[]> = {
  connected: ["gmail", "calendar", "notices"],
  desktop: ["work", "movement", "touch", "system"],
  companion: ["context", "music", "personality", "agent"],
  productivity: ["work", "notices", "focus", "agent"],
  personalize: ["appearance", "personality", "system"],
};

function Dots() {
  return <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>;
}

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-medallion">
        <Image src={publicAsset("/pawpico-face-logo.png")} alt="" aria-hidden="true" width={50} height={50} unoptimized />
      </span>
      <span><strong>PawPico</strong><small>PERSONAL DESKTOP CAT</small></span>
    </span>
  );
}

function PixelIcon({ children }: { children: ReactNode }) {
  return <span className="pixel-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [activeFilm, setActiveFilm] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const film = priorityFilms[activeFilm];
  const allowed = filterMap[activeFilter];
  const filteredGroups = activeFilter === "all" ? featureGroups : featureGroups.filter((group) => allowed.includes(group.id));
  const featuredGroups = filteredGroups.slice(0, 3);
  const additionalGroups = filteredGroups.slice(3);

  const renderFeature = (group: (typeof featureGroups)[number], shouldPlay = true) => (
    <article className="feature-drawer" key={group.id}>
      <div className="drawer-head">
        <PixelIcon>{group.icon}</PixelIcon>
        <div className="drawer-title">
          <small>{String(featureGroups.indexOf(group) + 1).padStart(2, "0")} / {group.label}</small>
          <h3>{group.title}</h3>
          <p>{group.lead}</p>
        </div>
        <div className="drawer-film">
          <video autoPlay={shouldPlay} loop muted playsInline preload="metadata" aria-label={`${group.title} animation`}>
            <source src={publicAsset(group.video)} type="video/mp4" />
          </video>
          <b>IN APP</b>
        </div>
      </div>
      <ol>
        {group.items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
      </ol>
    </article>
  );

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PawPico home"><Brand /></a>
        <nav aria-label="Primary navigation">
          <a href="#command-deck">Highlights</a>
          <a href="#complete">Every feature</a>
          <a href="#motion">Animations</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <a className="metal-button compact" href="#download">Get PawPico <span className="button-arrow down" aria-hidden="true" /></a>
      </header>

      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> WINDOWS COMPANION / CONNECTED WHEN YOU CHOOSE</div>
          <h1>Your desktop,<br /><em>now with a pulse.</em></h1>
          <p>
            PawPico is an expressive pixel cat, a tiny productivity console, and a private
            Windows companion in one. It lives on your windows, learns the rhythm of your work,
            and connects to Gmail or Calendar only when invited.
          </p>
          <div className="hero-actions">
            <a className="metal-button primary" href="#command-deck">Open the command deck <span className="button-arrow down-right" aria-hidden="true" /></a>
            <a className="text-link" href="#complete">Inspect every verified feature</a>
          </div>
          <div className="hero-readout">
            <span><b>87</b><small>motion states</small></span>
            <span><b>05</b><small>body types</small></span>
            <span><b>07</b><small>coat patterns</small></span>
            <span><b>02</b><small>opt-in connectors</small></span>
          </div>
        </div>

        <div className="hero-terminal" aria-label="Animated PawPico personality reel">
          <div className="terminal-rim">
            <div className="terminal-head">
              <span>PAWPICO PERSONALITY CORE / P-01</span>
              <span className="terminal-state"><i /> LIVE</span>
              <Dots />
            </div>
            <div className="terminal-screen">
              <video autoPlay loop muted playsInline preload="auto" poster={publicAsset("/pawpico-hero.png")}>
                <source src={publicAsset("/pawpico-idle-reel.mp4")} type="video/mp4" />
              </video>
              <span className="screen-label top">ACTUAL APP RENDERER</span>
              <span className="screen-label bottom">CHEER / SING / LISTEN / GROOM / REST</span>
            </div>
            <div className="terminal-deck">
              <span className="speaker" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</span>
              <span className="meter"><small>PERSONALITY</small><b><i style={{ width: "92%" }} /></b></span>
              <span className="meter"><small>DISTRACTION</small><b><i style={{ width: "18%" }} /></b></span>
              <span className="dial"><i /></span>
            </div>
          </div>
          <span className="floating-note note-one">ACTUAL IN-APP ANIMATION</span>
          <span className="floating-note note-two">ORANGE CAT / GREEN EYES</span>
        </div>
      </section>

      <div className="signal-strip" aria-label="PawPico highlights">
        <div>{["WORKS", "NOTIFIES", "CLIMBS", "PURRS", "FOCUSES", "SINGS", "READS", "STRETCHES", "DREAMS", "CELEBRATES"].map((word) => <span key={word}>{word}<i>◆</i></span>)}</div>
      </div>

      <section className="command-section section-shell section-pad" id="command-deck">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE ESSENTIAL FIVE</div>
            <h2>Start with what makes<br /><em>PawPico indispensable.</em></h2>
          </div>
          <p>These are the highest-impact systems in the current Windows build. Choose a module to see its real cat animation and exact product behavior.</p>
        </div>

        <div className="command-console">
          <div className="console-nav" role="tablist" aria-label="Choose a primary PawPico feature">
            {priorityFilms.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeFilm === index}
                className={activeFilm === index ? "active" : ""}
                onClick={() => setActiveFilm(index)}
                key={item.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{item.eyebrow.split(" / ")[1]}</b>
                <i className="button-arrow up-right" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className={`console-display accent-${film.accent}`} key={film.id}>
            <div className="console-film">
              <div className="console-titlebar"><span>{film.eyebrow.toUpperCase()} / VERIFIED FILM</span><Dots /></div>
              <video key={film.video} autoPlay loop muted playsInline controls preload="metadata" aria-label={`${film.title} feature film`}>
                <source src={publicAsset(film.video)} type="video/mp4" />
              </video>
            </div>
            <div className="console-copy">
              <div className="eyebrow">{film.eyebrow}</div>
              <h3>{film.title}</h3>
              <p>{film.copy}</p>
              <div className="signal-pills">{film.signals.map((signal) => <span key={signal}><i />{signal}</span>)}</div>
              <ol>{film.facts.map((fact, index) => <li key={fact}><span>0{index + 1}</span>{fact}</li>)}</ol>
            </div>
          </div>
        </div>
      </section>

      <section className="complete-section section-pad" id="complete">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SOURCE-VERIFIED SYSTEM DIRECTORY</div>
              <h2>Every feature.<br /><em>Down to the small ones.</em></h2>
            </div>
            <p>Nothing here is inferred from marketing copy. Each detail is matched to the current application source, native Windows modules, tests, and installer build.</p>
          </div>

          <div className="feature-filter" role="tablist" aria-label="Filter PawPico features">
            {filters.map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={activeFilter === id ? "active" : ""}
                onClick={() => {
                  setActiveFilter(id);
                  setShowAllFeatures(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="feature-directory">
            {featuredGroups.map((group) => renderFeature(group))}
          </div>

          {additionalGroups.length > 0 && (
            <>
              <div className={`feature-expansion ${showAllFeatures ? "is-open" : ""}`} aria-hidden={!showAllFeatures}>
                <div className="feature-expansion-inner">
                  <div className="feature-directory feature-directory-more">
                    {additionalGroups.map((group) => renderFeature(group, showAllFeatures))}
                  </div>
                </div>
              </div>
              <div className="feature-expansion-control">
                <button
                  type="button"
                  className="metal-button feature-expansion-button"
                  aria-expanded={showAllFeatures}
                  onClick={() => setShowAllFeatures((visible) => !visible)}
                >
                  {showAllFeatures ? "Show fewer features" : `See all ${filteredGroups.length} features`}
                  <span className={`button-arrow down ${showAllFeatures ? "is-up" : ""}`} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="motion-section section-pad" id="motion">
        <div className="section-shell">
          <div className="motion-intro">
            <div>
              <div className="eyebrow light">THE COMPLETE MOTION LEDGER</div>
              <h2>Eighty-seven states.<br /><em>One coherent little animal.</em></h2>
            </div>
            <div className="motion-orb">
              <span><b>87</b><small>DEFINED<br />STATES</small></span>
              <i />
            </div>
          </div>
          <div className="ledger-grid">
            {animationLedger.map(([title, states]) => (
              <article key={title as string}>
                <header><span>{title}</span><i /></header>
                <div>{(states as string[]).map((state) => <span key={state}>{state}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="privacy-section section-pad" id="privacy">
        <div className="section-shell privacy-shell">
          <div className="privacy-copy">
            <div className="eyebrow">PRIVACY, WITH THE CONNECTORS EXPLAINED</div>
            <h2>Local-first.<br /><em>Network only by invitation.</em></h2>
            <p>
              PawPico&apos;s desktop behavior stays on the computer. Gmail and Calendar are the only
              network features, both off until you connect them, and each talks directly to the
              service you chose—never to PawPico analytics or an intermediary account.
            </p>
          </div>
          <div className="privacy-seal" aria-hidden="true"><span>NO</span><b>TRACKING</b><i>◆</i></div>
          <div className="privacy-grid">
            <span><b>No screen capture</b><small>Only window rectangles become ledges.</small></span>
            <span><b>No key identities</b><small>Typing consumes an aggregate activity count.</small></span>
            <span><b>No document reading</b><small>Context comes from executable names only.</small></span>
            <span><b>No track metadata</b><small>Music uses a single playback-state boolean.</small></span>
            <span><b>No microphone audio</b><small>Singing uses capture-active state only.</small></span>
            <span><b>No cursor history</b><small>Samples drive motion and are discarded.</small></span>
            <span><b>Gmail: envelope only</b><small>Newest sender, subject, UID, and unread count.</small></span>
            <span><b>Calendar: private feed</b><small>Upcoming event times and summaries, parsed locally.</small></span>
            <span><b>Offline license check</b><small>No account or activation server.</small></span>
          </div>
        </div>
      </section>

      <section className="download section-shell section-pad" id="download">
        <div className="download-card">
          <div className="download-logo">
            <Image src={publicAsset("/pawpico-face-logo.png")} alt="PawPico orange pixel cat face logo with glossy green eyes" width={500} height={500} unoptimized />
          </div>
          <div className="download-copy">
            <div className="eyebrow">WINDOWS 10 / 11 · 64-BIT</div>
            <h2>Put a small, bright<br /><em>presence on your desktop.</em></h2>
            <p>Full-feature trial included. One offline license keeps the complete PawPico experience.</p>
          </div>
          <div className="purchase-block">
            <span>ONE-TIME PRICE</span>
            <strong>$5.99</strong>
            <a className="metal-button primary large" href="#top">Get PawPico <i className="button-arrow up" aria-hidden="true" /></a>
            <small>PAY ONCE · NO SUBSCRIPTION</small>
          </div>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <a className="brand" href="#top"><Brand /></a>
        <p>Quiet company. Curious motion. Very small paws.</p>
        <span>© 2026 PAWPICO / WINDOWS</span>
      </footer>
    </main>
  );
}
