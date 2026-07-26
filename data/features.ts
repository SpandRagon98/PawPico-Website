export type FeatureGroup =
  | "Helps me work"
  | "Keeps me on track"
  | "Lives on my desktop"
  | "Reacts to my day"
  | "Looks like mine"
  | "Respects my privacy";

export type FeatureStory = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  group: FeatureGroup;
  scene: string;
  story: string;
  detail: string;
  demoLabel: string;
  video: string;
  accent: "mint" | "pink" | "lavender" | "blue" | "peach" | "yellow";
  facts: string[];
};

export const featureStories: FeatureStory[] = [
  {
    id: "cursor",
    number: "01",
    title: "Cursor companion",
    shortTitle: "Cursor",
    group: "Lives on my desktop",
    scene: "The pointer pauses. Two green eyes notice.",
    story:
      "MewMuze watches the cursor, follows with a restrained little head turn and sometimes decides it is worth chasing.",
    detail:
      "Cursor samples drive the moment and are discarded. Nothing becomes a cursor-history log.",
    demoLabel: "watch → approach → chase → pounce",
    video: "/videos/touch-and-mochi.mp4",
    accent: "mint",
    facts: ["Glossy pupils lead the head", "Hover earns a look", "Playful profiles chase more often"],
  },
  {
    id: "petting",
    number: "02",
    title: "Petting",
    shortTitle: "Petting",
    group: "Reacts to my day",
    scene: "A gentle stroke becomes a tiny ritual.",
    story:
      "Move back and forth across MewMuze and the cat softens from a curious glance into closed eyes, purrs and a few shy hearts.",
    detail:
      "Plain hovering never counts as petting; the gesture needs deliberate, gentle movement.",
    demoLabel: "look → soften → loaf → purr",
    video: "/videos/gaze-and-purr.mp4",
    accent: "pink",
    facts: ["Gesture-aware petting", "Purrs are optional", "Repeated grabbing can annoy"],
  },
  {
    id: "sleep",
    number: "03",
    title: "Doze and sleep",
    shortTitle: "Doze",
    group: "Reacts to my day",
    scene: "The cursor rests. MewMuze finally yawns.",
    story:
      "After the chosen period of real inactivity, MewMuze opens into a full yawn, curls down and sleeps until nearby movement wakes the cat.",
    detail:
      "A merely parked pointer does not wake the cat. Nearby movement does.",
    demoLabel: "idle → yawn → curl → dream",
    video: "/videos/yawn-and-sleep.mp4",
    accent: "lavender",
    facts: ["User-set inactivity timing", "Energy recovers at rest", "Nearby movement wakes gently"],
  },
  {
    id: "work",
    number: "04",
    title: "Work Mode",
    shortTitle: "Work",
    group: "Helps me work",
    scene: "The desk gets busy. The cat gets a laptop.",
    story:
      "Work Mode parks MewMuze neatly beside a compact Quick Tools panel for local image and PDF conversion.",
    detail:
      "The panel tries the clearest side of the cat and stays inside the monitor work area.",
    demoLabel: "park → lightning → local tools",
    video: "/videos/work-mode.mp4",
    accent: "yellow",
    facts: ["Images to PDF", "PDF to PNG or JPG", "Local processing"],
  },
  {
    id: "clipboard",
    number: "05",
    title: "Clipboard Assistant",
    shortTitle: "Clipboard",
    group: "Helps me work",
    scene: "A copied snippet needs somewhere calmer to land.",
    story:
      "The clipboard assistant keeps the text you explicitly copy close at hand, with a small cat-sized surface instead of another sprawling utility window.",
    detail:
      "It responds to clipboard content you choose to copy; it does not read the screen behind it.",
    demoLabel: "copy → notice → use",
    video: "/videos/context-companion.mp4",
    accent: "blue",
    facts: ["Explicit copied content", "No hidden screen reading", "Compact desktop placement"],
  },
  {
    id: "focus",
    number: "06",
    title: "Focus Mode",
    shortTitle: "Focus",
    group: "Keeps me on track",
    scene: "One task. One timer. One very serious cat.",
    story:
      "Focus Mode settles MewMuze front-facing, suppresses chasing and quietly counts a steady work session upward.",
    detail:
      "Small nods and cheers punctuate longer sessions without turning the desktop into a game.",
    demoLabel: "settle → focus → tiny cheer",
    video: "/videos/focus-and-agent.mp4",
    accent: "mint",
    facts: ["Count-up focus timer", "Chasing pauses", "Quiet encouragement"],
  },
  {
    id: "pomodoro",
    number: "07",
    title: "Pomodoro",
    shortTitle: "Pomodoro",
    group: "Keeps me on track",
    scene: "A rhythm for work, rest and coming back.",
    story:
      "Choose focus, short break, long break and cycle lengths; MewMuze keeps the phase visible and celebrates completion.",
    detail:
      "Start, pause, resume, skip and reset remain under your control.",
    demoLabel: "focus → break → return",
    video: "/videos/focus-tools.mp4",
    accent: "peach",
    facts: ["Configurable phases", "Pause and resume", "Cycle completion"],
  },
  {
    id: "breaks",
    number: "08",
    title: "Break and water reminders",
    shortTitle: "Breaks",
    group: "Keeps me on track",
    scene: "A small paw interrupts the fourth hour.",
    story:
      "Stretch and water nudges arrive as restrained notebook notices with matching cat reactions.",
    detail:
      "Work-rest checks count active use rather than simple wall-clock time.",
    demoLabel: "active use → nudge → snooze",
    video: "/videos/smart-notifications.mp4",
    accent: "blue",
    facts: ["Stretch intervals", "Water intervals", "Active-use awareness"],
  },
  {
    id: "reminders",
    number: "09",
    title: "Custom reminders",
    shortTitle: "Reminders",
    group: "Keeps me on track",
    scene: "The thing you meant to remember appears beside a cat.",
    story:
      "Create one-off appointments or repeating personal nudges with your own message.",
    detail:
      "Warn and due states use distinct colors, and scheduled reminders support snooze or done.",
    demoLabel: "write → warn → done",
    video: "/videos/notices-motion.mp4",
    accent: "pink",
    facts: ["User-written messages", "Warn and due states", "Snooze and mark done"],
  },
  {
    id: "gmail",
    number: "10",
    title: "Gmail",
    shortTitle: "Gmail",
    group: "Helps me work",
    scene: "New mail, delivered by cat.",
    story:
      "When you opt in, MewMuze checks Gmail once per minute and surfaces only the newest sender and subject.",
    detail:
      "The first successful check establishes a quiet baseline, so old messages never create a burst.",
    demoLabel: "quiet poll → wave → envelope",
    video: "/videos/gmail-connector.mp4",
    accent: "mint",
    facts: ["IMAP over TLS", "Email body is never read", "Revocable app password"],
  },
  {
    id: "calendar",
    number: "11",
    title: "Google Calendar",
    shortTitle: "Calendar",
    group: "Helps me work",
    scene: "The meeting is close. The ears go up.",
    story:
      "A private iCal feed becomes a gentle early warning and then a clearer starting-now notice.",
    detail:
      "The feed refreshes every five minutes and is parsed locally. Timed events drive alerts.",
    demoLabel: "upcoming → warn → now",
    video: "/videos/calendar-connector.mp4",
    accent: "yellow",
    facts: ["Private iCal address", "0–120 minute warning", "Five-minute snooze"],
  },
  {
    id: "physics",
    number: "12",
    title: "Desktop Physics",
    shortTitle: "Physics",
    group: "Lives on my desktop",
    scene: "Windows become ledges. The taskbar becomes a floor.",
    story:
      "MewMuze walks, hops, balances, hangs and rides moving windows using the actual desktop geometry.",
    detail:
      "Multi-monitor work areas, mixed display scaling and safe recovery keep exploration contained.",
    demoLabel: "walk → jump → balance → land",
    video: "/videos/desktop-physics.mp4",
    accent: "lavender",
    facts: ["Window-top ledges", "Side clinging", "Multi-monitor awareness"],
  },
  {
    id: "context",
    number: "13",
    title: "Context aware",
    shortTitle: "Context",
    group: "Reacts to my day",
    scene: "Writing, coding and scrolling each get a different companion.",
    story:
      "Broad app category and activity select a fitting pose: notebook, tiny keyboard, reading strip or glasses.",
    detail:
      "MewMuze uses executable category and aggregate activity—not typed content or screen capture.",
    demoLabel: "write → type → read → rest",
    video: "/videos/context-companion.mp4",
    accent: "blue",
    facts: ["No key identities", "No screen capture", "Priority-controlled reactions"],
  },
  {
    id: "music",
    number: "14",
    title: "Music",
    shortTitle: "Music",
    group: "Reacts to my day",
    scene: "Playback starts. Headphones appear.",
    story:
      "Windows media playback state gives MewMuze a small headphone dance with a raised paw and music notes.",
    detail:
      "No title, artist, album artwork or other track metadata is read.",
    demoLabel: "playback → headphones → bop",
    video: "/videos/music-and-singing.mp4",
    accent: "pink",
    facts: ["Playback state only", "No track metadata", "Optional sound stays muted by default"],
  },
  {
    id: "microphone",
    number: "15",
    title: "Microphone reaction",
    shortTitle: "Microphone",
    group: "Reacts to my day",
    scene: "A call begins. MewMuze finds a tiny microphone.",
    story:
      "When another application is actively using a microphone, MewMuze sings along and bows when capture ends.",
    detail:
      "The cat detects capture-active state only. It never opens, records or transcribes the microphone stream.",
    demoLabel: "capture on → sing → bow",
    video: "/videos/music-and-singing.mp4",
    accent: "peach",
    facts: ["Activity state only", "No recording", "No transcription"],
  },
  {
    id: "appearance",
    number: "16",
    title: "Appearance Studio",
    shortTitle: "Appearance",
    group: "Looks like mine",
    scene: "Same little soul. Your favorite coat.",
    story:
      "Five body plans, seven coat patterns, independent colors and three display sizes make the companion feel personal.",
    detail:
      "The current default accessory choice is intentionally simple: None or Flower Band.",
    demoLabel: "body → pattern → color → flower",
    video: "/videos/customization-studio.mp4",
    accent: "pink",
    facts: ["Five body plans", "Seven patterns", "None or Flower Band"],
  },
  {
    id: "personality",
    number: "17",
    title: "Personality and rest",
    shortTitle: "Personality",
    group: "Looks like mine",
    scene: "Not a loop. A quiet little temperament.",
    story:
      "Energy, curiosity, recent interaction and weighted choices create slow blinks, grooming, play, sleepiness and the occasional sulk.",
    detail:
      "Calm, balanced and playful profiles change the rhythm without changing the cat you chose.",
    demoLabel: "calm ↔ curious ↔ playful ↔ sleepy",
    video: "/videos/rest-and-emotion.mp4",
    accent: "lavender",
    facts: ["Mood-driven choices", "Energy and recovery", "Calm activity profiles"],
  },
  {
    id: "peek",
    number: "18",
    title: "Peek Mode",
    shortTitle: "Peek",
    group: "Lives on my desktop",
    scene: "Full screen? Just the ears, then.",
    story:
      "During presentations and full-screen work, MewMuze can retreat to a restrained corner peek instead of covering content.",
    detail:
      "Peek can be automatic or manual and remains secondary to focused desktop work.",
    demoLabel: "notice full screen → retreat → peek",
    video: "/videos/desktop-roaming.mp4",
    accent: "mint",
    facts: ["Automatic or manual", "Presentation-friendly", "Returns when space is available"],
  },
  {
    id: "agent",
    number: "19",
    title: "Local Agent Status",
    shortTitle: "Agent",
    group: "Respects my privacy",
    scene: "A local task changes state. The cat understands the signal.",
    story:
      "Point MewMuze at one explicit local JSON status file and the cat can think, run, wait, celebrate or ask for attention.",
    detail:
      "The integration is off until you supply an absolute path; it never scans outside that exact file.",
    demoLabel: "idle → thinking → running → success",
    video: "/videos/focus-and-agent.mp4",
    accent: "yellow",
    facts: ["One explicit file", "No folder scanning", "Local status only"],
  },
  {
    id: "lightweight",
    number: "20",
    title: "Lightweight Windows companion",
    shortTitle: "Lightweight",
    group: "Respects my privacy",
    scene: "Lively when you notice. Nearly still when you do not.",
    story:
      "A transparent Windows overlay adapts its frame rate and detail to interaction, rest, hidden and full-screen states.",
    detail:
      "Dynamic click-through keeps the desktop usable everywhere outside the cat, its menus and panels.",
    demoLabel: "interact → settle → near-zero hidden",
    video: "/mewmuze-idle-reel.mp4",
    accent: "blue",
    facts: ["Adaptive rendering", "Dynamic click-through", "Windows 10 and 11"],
  },
];

export const featureGroups: FeatureGroup[] = [
  "Helps me work",
  "Keeps me on track",
  "Lives on my desktop",
  "Reacts to my day",
  "Looks like mine",
  "Respects my privacy",
];
