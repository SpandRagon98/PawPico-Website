"use client";

import { useState, type ReactNode } from "react";

const films = [
  {
    id: "physics",
    number: "01",
    label: "Desktop physics",
    title: "A desktop becomes cat territory.",
    copy: "PawPico walks, sprints, leaps between ledges, clings to window edges, hangs by two paws, slips to one, and either pulls itself up or tumbles into a real landing.",
    video: "/videos/desktop-physics.mp4",
    chapters: ["walk + sprint", "long jump", "edge climb", "two-paw hang", "pull-up"],
  },
  {
    id: "touch",
    number: "02",
    label: "Touch & mochi",
    title: "Soft to pet. Properly squishy to hold.",
    copy: "The glossy pupils follow first, the head leans a little later, and gentle strokes close the eyes into a purr. Pick PawPico up by the scruff and the whole body stretches, shears, recoils, and wobbles back.",
    video: "/videos/touch-and-mochi.mp4",
    chapters: ["eye tracking", "pet + purr", "mochi stretch", "rubber recoil"],
  },
  {
    id: "work",
    number: "03",
    label: "Work mode",
    title: "Lightning in. Sunglasses on. Work starts.",
    copy: "A pixel bolt transforms PawPico into a parked laptop operator. The nearby Quick Tools console converts images to PDF and PDFs to PNG or JPG without covering the cat.",
    video: "/videos/work-mode.mp4",
    chapters: ["lightning swap", "sunglasses", "laptop loop", "local PDF tools"],
  },
  {
    id: "context",
    number: "04",
    label: "Context companion",
    title: "It notices activity—not your content.",
    copy: "Writing opens a notebook. Typing brings out the keyboard. Fast typing turns into steam, then full panic. Slow browser scrolling opens a book, while coding brings out tiny glasses.",
    video: "/videos/context-companion.mp4",
    chapters: ["note taking", "keyboard", "overheat", "panic", "reading", "coding"],
  },
  {
    id: "sound",
    number: "05",
    label: "Music & singing",
    title: "Headphones for music. A microphone for you.",
    copy: "When Windows reports media playback, PawPico puts on headphones and bops with floating notes. When another app uses the microphone, it sings along—and bows when the performance ends.",
    video: "/videos/music-and-singing.mp4",
    chapters: ["music state", "headphone bop", "mic activity", "sing", "bow"],
  },
  {
    id: "emotion",
    number: "06",
    label: "Rest & emotion",
    title: "The tiny rituals are the personality.",
    copy: "Nods, paw-licks, face washes, ear scratches, happy hearts, annoyed tail flicks, hopeful sad eyes, a full open-mouth yawn, and a curled sleep story all belong to the same little cat.",
    video: "/videos/rest-and-emotion.mp4",
    chapters: ["cute nod", "grooming", "happy", "annoyed", "sad", "yawn", "sleep"],
  },
  {
    id: "style",
    number: "07",
    label: "Customization",
    title: "Five bodies. Seven coats. Twelve accessories.",
    copy: "Breed changes real proportions—head, torso, legs, ears, eyes, and tail. Then choose size, fur, eyes, inner ears, markings, everyday accessories, or costumes that follow the calendar.",
    video: "/videos/customization-studio.mp4",
    chapters: ["5 breeds", "7 patterns", "3 sizes", "colors", "12 accessories"],
  },
  {
    id: "focus",
    number: "08",
    label: "Focus & agent",
    title: "A calm co-worker with very small paws.",
    copy: "Pomodoro sessions, active-use rest checks, reminders, motivation placards, pinned notes, and an optional local agent-status file turn productivity into gentle companionship.",
    video: "/videos/focus-and-agent.mp4",
    chapters: ["Pomodoro", "reminders", "motivation", "agent thinking", "agent running", "success"],
  },
];

const featureGroups = [
  {
    id: "movement",
    preview: "/videos/desktop-physics.mp4",
    previewLabel: "PawPico walking, jumping, and climbing",
    icon: "↗",
    title: "Movement & desktop physics",
    count: "28 motion states",
    lead: "PawPico treats the Windows desktop as a physical world instead of a flat animation layer.",
    items: [
      "Walk, stalk, run, and full sprint with distinct eight-frame leg cycles",
      "Turn-around, left turn, right turn, look up, and look down",
      "Standard jump, small hop, vertical jump, long jump, fall, soft landing, and hard landing",
      "Walks along taskbar and window tops; balances or peeks at unsafe edges",
      "Hops between reachable windows and explores vertically as well as horizontally",
      "Clings to left or right window edges and climbs upward",
      "Hangs by two paws, slips to one paw, pulls up, or loses grip",
      "Rides a window when it moves; falls safely when the support closes or minimizes",
      "Landing squash, shake-off, and occasional embarrassed recovery after a clumsy fall",
      "Independent front, side, back, and three-quarter silhouettes; only side art is mirrored",
    ],
  },
  {
    id: "touch",
    preview: "/videos/touch-and-mochi.mp4",
    previewLabel: "PawPico reacting to touch and stretching like mochi",
    icon: "✦",
    title: "Cursor, touch & mochi",
    count: "20 interaction states",
    lead: "The pointer is a toy, a gaze target, a hand for petting, and the anchor for soft-body dragging.",
    items: [
      "Smooth pupil tracking with a restrained head lean so the neck stays connected",
      "Watches, approaches, stalks, chases, pounces, swats, and performs a full paw swipe",
      "Can visually catch the cursor, swing from it, lose grip, and land safely—without controlling the real pointer",
      "Gentle back-and-forth strokes trigger petting; plain hover only gets a look",
      "Petting cycles from half-closed eyes to closed-eye loafing, purrs, and hearts",
      "Quick clicks are pokes; repeated disturbance raises annoyance before it settles again",
      "Drag starts after a small movement or short hold, so clicks and lifts feel different",
      "Scruff-pinned mochi body stretches vertically, narrows under tension, leans, and trails behind",
      "Release transfers a gentle toss, overshoots its rest shape, and wobbles back",
      "Drop on a title bar to stand, just below it to hang, beside it to cling, or mid-air to fall",
    ],
  },
  {
    id: "personality",
    preview: "/videos/rest-and-emotion.mp4",
    previewLabel: "PawPico grooming, yawning, and showing emotion",
    icon: "☺",
    title: "Personality, moods & rest",
    count: "5 moods + 11 eye states",
    lead: "Energy, curiosity, recent interaction, and a little weighted randomness keep the cat calm without making it robotic.",
    items: [
      "Core moods: calm, curious, playful, sleepy, and annoyed",
      "Eye expressions: open, half, closed, wide, up, down, surprised, happy, focused, panicked, and sad",
      "Ear positions: up, back, perked, and flat; tails curl, lift, flick, tuck, puff, wrap, or hang down",
      "Mostly sits and watches by default, with wandering kept as occasional punctuation",
      "Slow blink, tail flick, clean paw, wash face, groom, scratch, look around, and full-body stretch",
      "Random front-facing cute nod with smile, blush, closed eyes, and tail flick",
      "Self-play includes tail chasing and paw swipes",
      "Energy drains while sprinting, jumping, climbing, catching, and dancing; it recovers while sitting or sleeping",
      "A motionless cursor triggers a full yawn before sleep; nearby movement wakes the cat",
      "After twenty minutes without a pet, the lowest-priority sad mood quietly appears",
    ],
  },
  {
    id: "context",
    preview: "/videos/context-companion.mp4",
    previewLabel: "PawPico reacting to writing, browsing, and coding",
    icon: "⌘",
    title: "Context-aware reactions",
    count: "Local signals only",
    lead: "PawPico reacts to simple Windows state. It never reads document text, page contents, track names, or recorded audio.",
    items: [
      "Writing apps: opens a notebook, writes, and occasionally glances back at the screen",
      "Steady typing: attacks a tiny keyboard with alternating paws and the occasional wrong-key surprise",
      "Sustained fast typing: blushes and emits steam; twenty-five uninterrupted seconds escalates into panic",
      "Browser scrolling: looks up or down and unrolls a little paper strip",
      "Sustained slow browser scrolling: settles with a book and scans the page",
      "Coding apps and terminals: automatically puts on glasses",
      "Media playing: swaps to headphones, dances, smiles, raises a paw, and floats music notes",
      "Another app using the microphone: takes a mic, sings with a swaying body, then bows when capture ends",
      "Explain-this-screen message describes only the foreground app name, broad category, and whether media is playing",
      "Reaction priority prevents work mode, panic, singing, agents, music, writing, typing, reading, and scrolling from fighting",
    ],
  },
  {
    id: "work",
    preview: "/videos/work-mode.mp4",
    previewLabel: "PawPico using its laptop in Work mode",
    icon: "⚡",
    title: "Work mode & Quick Tools",
    count: "A real utility mode",
    lead: "Work mode is not just a costume. It parks the cat, gives it a laptop, and opens a local conversion console beside it.",
    items: [
      "Entered from the cat’s compact right-click menu or the system tray",
      "Crisp lightning strike hides the transformation at the flash peak",
      "Sunglasses and a slow, focused laptop loop replace roaming and cursor chasing",
      "Panel tries right, left, above, then below; it stays inside the monitor work area and avoids the cat",
      "JPG or PNG to PDF, including several images combined in selected order",
      "JPEG pages are embedded without re-encoding when possible",
      "PDF to PNG or JPG at 96, 150, or 300 DPI",
      "All conversions run locally; PDF rendering degrades honestly if its local renderer is unavailable",
      "DOC/DOCX conversion is clearly marked coming soon and is not falsely attempted",
      "Exit from the same menu entry, panel close button, or tray",
    ],
  },
  {
    id: "focus",
    preview: "/videos/focus-and-agent.mp4",
    previewLabel: "PawPico helping with focus sessions and reminders",
    icon: "◷",
    title: "Focus, reminders & notes",
    count: "Gentle productivity",
    lead: "The productivity layer is designed to feel like a companion checking in, never a system notification shouting.",
    items: [
      "Configurable Pomodoro focus, short break, long break, and cycle count",
      "Focus phase suppresses cursor chasing while eye tracking stays alive",
      "Stretch reminders with a real cat stretch; water reminders with a happy reaction",
      "Work-rest reminders count active computer use, pause while away, and stay quiet in full-screen",
      "Unlimited custom reminder messages and intervals",
      "Notebook-style reminder bubble with typewriter reveal, OK, and five-minute snooze",
      "Pinned note stays tucked near the cat",
      "Optional local display name personalizes reminders and encouragement",
      "Motivation appears after sustained active work with glasses, an overhead placard, and rotating messages",
      "Cat Off waves goodbye, fades and shrinks, while the tray remains available",
    ],
  },
  {
    id: "agent",
    preview: "/videos/focus-and-agent.mp4",
    previewLabel: "PawPico reacting to local AI-agent status",
    icon: "◆",
    title: "Local AI-agent companion",
    count: "8 status values",
    lead: "Point PawPico at one small JSON file that a local tool owns. Nothing else on the machine is inspected.",
    items: [
      "Idle releases the cat back to its normal behavior",
      "Thinking raises a paw and looks upward",
      "Running kneads like a tiny operator",
      "Waiting watches attentively",
      "Success celebrates, meows when sound is enabled, and shows a finished message",
      "Failed looks confused and explains that the agent hit an error",
      "Attention triggers a startled jump",
      "Integration is disabled until the user explicitly enters a local file path",
    ],
  },
  {
    id: "appearance",
    preview: "/videos/customization-studio.mp4",
    previewLabel: "PawPico showing body, color, and accessory choices",
    icon: "◈",
    title: "Appearance & wardrobe",
    count: "5 × 7 × 12",
    lead: "Customization changes anatomy, not only color. The live preview applies every edit immediately.",
    items: [
      "Classic: balanced house-cat proportions",
      "Chonk: round body, stubby legs, heavy cheeks, and thicker tail",
      "Fluffy: larger mass, ear tufts, neck ruff, and plume tail",
      "Siamese: slender, leggy build, tall ears, thin tail, and dark points",
      "Kitten: tiny body with an oversized head and the largest eyes",
      "Small, medium, and large display sizes",
      "Independent fur, iris, and inner-ear color controls",
      "Solid, tuxedo, tabby, socks, spotted, calico, and bicolour markings",
      "Sunglasses, glasses, headphones, bandana, watch, hat, and cap",
      "Santa hat, witch hat, party hat, flower crown, and winter scarf",
      "Automatic calendar outfits: Halloween, December, New Year, deep winter, and spring",
    ],
  },
  {
    id: "system",
    preview: "/pawpico-idle-reel.mp4",
    previewLabel: "PawPico calmly living on the Windows desktop",
    icon: "▣",
    title: "Windows behavior, privacy & sound",
    count: "Quiet infrastructure",
    lead: "The companion is a transparent Windows overlay built to disappear as infrastructure and remain visible as personality.",
    items: [
      "Transparent, borderless, always-on-top virtual-desktop overlay with no taskbar entry",
      "Dynamic click-through everywhere except the cat, drag, menu, and panels",
      "Multi-monitor geometry, mixed DPI scaling, taskbar-aware work areas, and off-screen recovery",
      "Automatic or manual corner peek during full-screen apps and presentations",
      "Adaptive detail and frame rate: lively while interacting, slower while calm or asleep, near-zero while hidden",
      "Optional synthesized purr, landing tap, meow, and sleep tone with quiet rate limits",
      "Tray controls for Cat On/Off, pause, pet, call, sleep, Work mode, chase, sound, activity, size, startup, reset, settings, and quit",
      "Calm, balanced, and playful temperament profiles",
      "Start with Windows, automatic update check, reset position, reset settings, and live appearance preview",
      "No account, analytics, screen capture, key identities, document contents, cursor history, track metadata, or microphone audio",
    ],
  },
];

const animationLedger = [
  ["Movement", ["idle", "side idle", "back idle", "walk", "stalk", "run", "sprint", "turn around", "turn left", "turn right", "look up", "look down", "jump", "small hop", "vertical jump", "long jump", "fall", "land", "soft land", "hard land", "climb", "climb up", "climb down", "step down", "balance", "hang—two paws", "hang—one paw", "pull up"]],
  ["Rest & rituals", ["sit", "side sit", "cute nod", "lie down", "sleep", "wake up", "stretch", "yawn", "blink", "tail flick", "clean paw", "clean face", "scratch", "groom", "look around"]],
  ["Cursor play", ["watch", "approach", "chase", "pounce", "swat", "paw swipe", "catch", "hold", "dragged by cursor", "cursor grab", "cursor swing", "lose grip", "land safe", "confused", "startled", "tired", "tail chase", "peek"]],
  ["Touch & emotion", ["petted", "petted—eyes closed", "purr", "picked up", "dangle", "dragged—surprised", "placed down", "shake", "annoyed", "happy"]],
  ["Work & context", ["knead", "overheat", "think", "celebrate", "wave", "write notes", "type keys", "sing", "bow", "Quick Tools", "panic", "sad", "placard", "read book", "dance bop", "embarrassed"]],
];

const everydayAccessories = ["Sunglasses", "Glasses", "Headphones", "Bandana", "Watch", "Hat", "Cap"];
const seasonalAccessories = ["Santa hat", "Witch hat", "Party hat", "Flower crown", "Winter scarf"];
const patterns = ["Solid", "Tuxedo", "Tabby", "Socks", "Spotted", "Calico", "Bicolour"];

function Dots() {
  return <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>;
}

function PixelIcon({ children }: { children: ReactNode }) {
  return <span className="pixel-icon" aria-hidden="true">{children}</span>;
}

function Brand() {
  return (
    <span className="brand-lockup">
      <img className="brand-logo" src="/pawpico-face-logo.png" alt="" aria-hidden="true" />
      <span><strong>PawPico</strong><small>DESKTOP CAT</small></span>
    </span>
  );
}

export default function Home() {
  const [activeFilm, setActiveFilm] = useState(0);
  const [activeGroup, setActiveGroup] = useState("all");
  const film = films[activeFilm];
  const visibleGroups = activeGroup === "all" ? featureGroups : featureGroups.filter((group) => group.id === activeGroup);

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PawPico home">
          <Brand />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#films">Feature films</a>
          <a href="#complete">Every feature</a>
          <a href="#atelier">Atelier</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <a className="pixel-button mini" href="#download">Get PawPico <span>↓</span></a>
      </header>

      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="kicker"><span className="live-dot" /> WINDOWS DESKTOP COMPANION · FULLY LOCAL</div>
          <h1>One tiny cat.<br /><em>An entire inner life.</em></h1>
          <p>
            PawPico walks your windows, watches your cursor, sings when the microphone is live,
            dances in headphones, works at a laptop, reads beside you, and quietly develops moods
            of its own.
          </p>
          <div className="hero-actions">
            <a className="pixel-button primary" href="#films">Meet every side of PawPico <span>↘</span></a>
            <a className="underlink" href="#complete">Read the complete feature index</a>
          </div>
          <div className="hero-stats" aria-label="Verified product statistics">
            <span><strong>87</strong><small>animation states</small></span>
            <span><strong>5</strong><small>real body types</small></span>
            <span><strong>12</strong><small>accessories</small></span>
            <span><strong>100%</strong><small>local reactions</small></span>
          </div>
        </div>

        <div className="hero-machine" aria-label="PawPico live product portrait">
          <div className="machine-bezel">
            <div className="machine-top"><span>PAWPICO PERSONALITY UNIT · P-01</span><Dots /></div>
            <div className="machine-screen">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/pawpico-hero.png"
                aria-label="PawPico stays seated while cheering, singing, listening to music, licking a paw, and getting tired"
              >
                <source src="/pawpico-idle-reel.mp4" type="video/mp4" />
              </video>
              <span className="scanlines" />
              <span className="screen-chip">IDLE PERSONALITY REEL</span>
            </div>
            <div className="machine-deck">
              <span className="speaker-grid" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</span>
              <span><b>MOTION</b><small>IN PLACE</small></span>
              <span><b>REEL</b><small>ON LOOP</small></span>
              <span className="machine-knob"><i /></span>
            </div>
          </div>
          <div className="stitched-tag left">Actual in-app animations</div>
          <div className="stitched-tag right">Cheer · sing · listen · groom · rest</div>
        </div>
      </section>

      <div className="ticker" aria-label="PawPico behavior highlights">
        <div>
          {["WALKS", "CLIMBS", "HANGS", "PURRS", "SINGS", "DANCES", "READS", "TYPES", "YAWNS", "DREAMS", "WORKS", "CELEBRATES"].map((word) => (
            <span key={word}>{word}<i>✦</i></span>
          ))}
        </div>
      </div>

      <section className="films section-shell section-pad" id="films">
        <div className="section-heading">
          <div><div className="kicker">08 VERIFIED FEATURE FILMS</div><h2>Not mockups.<br /><em>The real cat in motion.</em></h2></div>
          <p>Every film below is rendered from PawPico’s actual pose system, current orange coat, green eyes, red inner ears, and product props. Choose a reel to inspect it.</p>
        </div>

        <div className="film-console">
          <div className="film-screen">
            <div className="film-titlebar"><span>REEL {film.number} · {film.label.toUpperCase()}</span><Dots /></div>
            <video key={film.video} autoPlay loop muted playsInline controls preload="metadata" aria-label={`${film.label} feature film`}>
              <source src={film.video} type="video/mp4" />
            </video>
            <span className="scanlines" aria-hidden="true" />
          </div>
          <div className="film-copy">
            <span className="reel-number">{film.number}</span>
            <div className="kicker">{film.label}</div>
            <h3>{film.title}</h3>
            <p>{film.copy}</p>
            <div className="chapter-list">{film.chapters.map((chapter) => <span key={chapter}>{chapter}</span>)}</div>
          </div>
          <div className="reel-selector" role="tablist" aria-label="Choose a PawPico feature film">
            {films.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeFilm === index}
                className={activeFilm === index ? "active" : ""}
                onClick={() => setActiveFilm(index)}
                key={item.id}
              >
                <span>{item.number}</span><b>{item.label}</b><i aria-hidden="true">▶</i>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="work-mode section-pad">
        <div className="section-shell work-shell">
          <div className="work-copy">
            <div className="kicker light">PAWPICO AT WORK</div>
            <h2>A work mode<br /><em>with actual work inside.</em></h2>
            <p>Right-click PawPico, choose Work mode, and a lightning bolt swaps the cat into sunglasses and a laptop at the flash peak. Roaming pauses; eye tracking does not.</p>
            <div className="work-list">
              <span><PixelIcon>J</PixelIcon><b>JPG / PNG → PDF</b><small>One image or many, in chosen order</small></span>
              <span><PixelIcon>P</PixelIcon><b>PDF → PNG / JPG</b><small>96, 150, or 300 DPI export</small></span>
              <span><PixelIcon>⌖</PixelIcon><b>Smart panel placement</b><small>Right, left, above, or below—never casually over the cat</small></span>
              <span><PixelIcon>⌂</PixelIcon><b>Entirely local</b><small>No upload step and no conversion server</small></span>
            </div>
          </div>
          <div className="work-device">
            <div className="work-video-frame">
              <video autoPlay loop muted playsInline controls preload="metadata" aria-label="PawPico Work mode demonstration">
                <source src="/videos/work-mode.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="work-dials"><span>MODE <b>LOCAL</b></span><i /><span>CAT <b>FOCUSED</b></span></div>
          </div>
        </div>
      </section>

      <section className="complete section-shell section-pad" id="complete">
        <div className="section-heading">
          <div><div className="kicker">SOURCE-VERIFIED INVENTORY</div><h2>Every feature.<br /><em>Nothing hand-waved.</em></h2></div>
          <p>This directory is based on the installed Windows build and its active behavior, animation, physics, settings, productivity, and native-integration systems.</p>
        </div>

        <div className="feature-filter" role="tablist" aria-label="Filter PawPico features">
          <button type="button" className={activeGroup === "all" ? "active" : ""} onClick={() => setActiveGroup("all")}>All systems</button>
          {featureGroups.map((group) => (
            <button type="button" key={group.id} className={activeGroup === group.id ? "active" : ""} onClick={() => setActiveGroup(group.id)}>
              {group.title.split(" & ")[0]}
            </button>
          ))}
        </div>

        <div className="feature-directory">
          {visibleGroups.map((group, index) => (
            <article className="feature-drawer" key={group.id}>
              <div className="drawer-head">
                <PixelIcon>{group.icon}</PixelIcon>
                <span><small>0{featureGroups.indexOf(group) + 1}</small><h3>{group.title}</h3><p>{group.lead}</p></span>
                <div className="drawer-preview">
                  <b>{group.count}</b>
                  <span className="drawer-cat-stage">
                    <video autoPlay loop muted playsInline preload="metadata" aria-label={group.previewLabel}>
                      <source src={group.preview} type="video/mp4" />
                    </video>
                  </span>
                </div>
              </div>
              <ol>
                {group.items.map((item, itemIndex) => (
                  <li key={item}><span>{String(itemIndex + 1).padStart(2, "0")}</span>{item}</li>
                ))}
              </ol>
              <i className="drawer-handle" aria-hidden="true">{index % 2 ? "•••" : "— —"}</i>
            </article>
          ))}
        </div>
      </section>

      <section className="emotion-section section-pad">
        <div className="section-shell emotion-shell">
          <div className="emotion-copy">
            <div className="kicker light">THE EXPRESSION ENGINE</div>
            <h2>Eyes lead.<br /><em>The whole body answers.</em></h2>
            <p>
              Eleven eye states combine with ears, pupils, mouth, tail, blush, steam, hearts, music notes,
              Zs, and two emotional color washes. That is why “sad” reads differently from “sleepy,” and
              “panic” is more than a faster idle.
            </p>
            <div className="expression-tokens">
              {["open", "half", "closed", "wide", "up", "down", "surprised", "happy", "focus", "panic", "sad"].map((eye) => <span key={eye}>{eye}</span>)}
            </div>
          </div>
          <div className="emotion-film">
            <video autoPlay loop muted playsInline controls preload="metadata" aria-label="PawPico emotion and sleep feature film">
              <source src="/videos/rest-and-emotion.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="atelier section-shell section-pad" id="atelier">
        <div className="atelier-frame">
          <div className="atelier-copy">
            <div className="kicker">THE PAWPICO ATELIER</div>
            <h2>Built differently.<br /><em>Dressed personally.</em></h2>
            <p>These are not palette swaps. Each breed changes head, torso, leg, ear, eye, and tail proportions before color, pattern, or wardrobe is applied.</p>
            <div className="breed-list">
              <span><b>Classic</b><small>balanced house cat</small></span>
              <span><b>Chonk</b><small>round + stubby</small></span>
              <span><b>Fluffy</b><small>tufts + ruff + plume</small></span>
              <span><b>Siamese</b><small>slender + dark points</small></span>
              <span><b>Kitten</b><small>tiny body + biggest eyes</small></span>
            </div>
          </div>
          <div className="atelier-film">
            <video autoPlay loop muted playsInline controls preload="metadata" aria-label="PawPico customization demonstration">
              <source src="/videos/customization-studio.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="wardrobe">
            <div><small>EVERYDAY</small>{everydayAccessories.map((item) => <span key={item}>{item}</span>)}</div>
            <div><small>SEASONAL</small>{seasonalAccessories.map((item) => <span key={item}>{item}</span>)}</div>
            <div><small>PATTERNS</small>{patterns.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="ledger section-pad">
        <div className="section-shell">
          <div className="section-heading compact">
            <div><div className="kicker">THE COMPLETE ANIMATION LEDGER</div><h2>All 87 states,<br /><em>accounted for.</em></h2></div>
            <p>These are the discrete animation states currently defined by the app—not a loose marketing estimate.</p>
          </div>
          <div className="ledger-grid">
            {animationLedger.map(([group, names]) => (
              <article key={group as string}>
                <header><span>{group}</span><b>{(names as string[]).length}</b></header>
                <div>{(names as string[]).map((name) => <span key={name}>{name}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="privacy-section section-pad" id="privacy">
        <div className="section-shell privacy-shell">
          <div className="privacy-seal" aria-hidden="true"><span>LOCAL</span><b>BY DESIGN</b><i>✦</i></div>
          <div className="privacy-title"><div className="kicker light">A TRUSTWORTHY BACKGROUND APP</div><h2>Smart enough to react.<br /><em>Disciplined enough not to pry.</em></h2></div>
          <div className="privacy-grid">
            <span><b>No screen capture</b><small>Only window rectangles become ledges.</small></span>
            <span><b>No key identities</b><small>Typing uses only an aggregate keys-down count.</small></span>
            <span><b>No document reading</b><small>Writing and browser categories come from app names.</small></span>
            <span><b>No track metadata</b><small>Music reactions use one playback-state boolean.</small></span>
            <span><b>No microphone audio</b><small>Singing reacts only to whether capture is active.</small></span>
            <span><b>No cursor history</b><small>Position is sampled for animation and discarded.</small></span>
            <span><b>No analytics or account</b><small>Preferences remain on the machine.</small></span>
            <span><b>Optional local agent file</b><small>Off until the user provides one exact path.</small></span>
          </div>
        </div>
      </section>

      <section className="download section-shell section-pad" id="download">
        <div className="download-card">
          <img src="/pawpico-face-logo.png" alt="PawPico's orange pixel cat face with enormous glossy green eyes" />
          <div><div className="kicker">WINDOWS 10 / 11 · 64-BIT</div><h2>Give your desktop<br /><em>a small, beating heart.</em></h2><p>One cat. Eighty-seven states. No account or subscription required.</p></div>
          <div className="purchase-block">
            <span className="price-label">ONE-TIME PRICE</span>
            <strong>$5.99</strong>
            <a className="pixel-button primary large" href="#top">Get PawPico <span>↓</span></a>
            <small>Pay once · keep PawPico</small>
          </div>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <a className="brand" href="#top"><Brand /></a>
        <p>Built for quiet company, curious motion, and very small paws.</p>
        <span>© 2026 PAWPICO · WINDOWS</span>
      </footer>
    </main>
  );
}
