export type FeatureGroup =
  | "Helps me work"
  | "Keeps me on track"
  | "Lives on my desktop"
  | "Reacts to my day"
  | "Looks like mine"
  | "Respects my privacy";

/** A dummy in-app notice, shown on the site exactly as the app would show it. */
export type FeatureNotice = {
  app: string;
  title: string;
  body: string;
};

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
  /** Plain-English payoff: what this actually changes for the person using it. */
  helps: string;
  notice?: FeatureNotice;
};

const stories: Omit<FeatureStory, "helps" | "notice">[] = [
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
    facts: ["Private iCal address", "0 to 120 minute warning", "Five-minute snooze"],
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
      "MewMuze uses executable category and aggregate activity, never typed content or screen capture.",
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

const helps: Record<string, string> = {
  cursor:
    "The screen stops feeling like furniture. Something in there registers that you are present. You move the mouse, it looks up, and the room feels a little less empty than it did a second ago.",
  petting:
    "Thirty seconds of stroking a warm little animal is a genuinely better reset after a hard message than another lap around social media. It costs nothing and it is always within reach.",
  sleep:
    "The cat winds down when you do, so your desktop stops shouting at the end of the day. Watching something curl up and go quiet is a surprisingly strong signal that you are allowed to stop too.",
  work:
    "You stop handing private documents to a free converter website. The two file jobs you actually do, images into a PDF and a PDF back into images, happen on your own machine in seconds.",
  clipboard:
    "The thing you copied is still there when you need it two steps later, so you stop re-finding the same link, code or address for the third time in ten minutes.",
  focus:
    "A focus timer you do not resent. The cat sits down and works alongside you instead of a progress bar shaming you from a browser tab, which turns out to be a far better reason to keep going.",
  pomodoro:
    "Structure without rigidity. The cycle keeps its shape whether you are deep in it or stepping away, so a broken session never becomes a reason to abandon the whole afternoon.",
  breaks:
    "You actually stand up. A break you watch a cat take with you is much harder to dismiss than a notification you have already learned to click away without reading.",
  reminders:
    "The small things that fall through, the tablet, the callback, the water, arrive in your own words from something you like looking at, so they land instead of blending into the noise.",
  gmail:
    "You close the inbox tab that has been eating your afternoon. When something genuinely new lands, the cat waves and tells you who it is and what it is about. One line, no red badge, no falling back into the inbox.",
  calendar:
    "You stop joining calls four minutes late because a browser notification appeared behind a full-screen window. The warning comes from something always on top, with enough lead time to actually get ready.",
  physics:
    "This is the part that makes people call a colleague over. Your real windows are the world. The cat walks your taskbar, hops between the apps you have open, and hangs off the edge of whatever you are typing in.",
  context:
    "The cat reads the room without reading your screen. Open an editor and glasses appear; type hard for ten minutes and it starts steaming. You feel accompanied at work, from nothing more sensitive than an app name.",
  music:
    "Your music gets a tiny dancing audience. It costs you nothing, because MewMuze never learns the artist or the track, only that something is playing.",
  microphone:
    "Every call ends with a small bow. The cat knows the mic went live and nothing else. No stream is opened, recorded or transcribed.",
  appearance:
    "The cat becomes yours rather than a stock mascot. People rebuild a cat they have lost, match a partner's tabby, or invent something that never existed, and it greets them in that form every single morning.",
  personality:
    "This is why it does not get old in week three. Energy drains and recovers, moods carry over, affection is remembered, so the cat you have in March behaves like one you have lived with rather than a looping GIF.",
  peek:
    "It never costs you a meeting. When you present or go full screen, the cat steps aside on its own, so you get a companion without a single embarrassing moment.",
  agent:
    "Stop babysitting a long build. The cat works while the job runs and celebrates from across the screen when it lands, so you can go make tea and still know the moment it finishes.",
  lightweight:
    "It behaves itself. No taskbar clutter, clicks pass through to whatever is underneath, and it goes near idle when hidden, so company never costs you a battery or a frame rate.",
};

const notices: Record<string, FeatureNotice> = {
  gmail: {
    app: "GMAIL",
    title: "Priya Raman",
    body: "Hey! There is a new mail. “Re: the deck for Monday”",
  },
  calendar: {
    app: "CALENDAR",
    title: "In 10 minutes",
    body: "Design standup. Want me to nudge you again at five?",
  },
  reminders: {
    app: "REMINDER",
    title: "52 minutes in",
    body: "Stand up and stretch. I will wait right here.",
  },
  focus: {
    app: "FOCUS",
    title: "25:00 complete",
    body: "Nice run. Take five, I will guard the desk.",
  },
  breaks: {
    app: "BREAK",
    title: "Break's over",
    body: "Back when you are ready. No rush.",
  },
  agent: {
    app: "AGENT",
    title: "Build finished",
    body: "All tests green. I did the celebrating already.",
  },
  clipboard: {
    app: "CLIPBOARD",
    title: "Saved for later",
    body: "That tracking number is still here when you need it.",
  },
  work: {
    app: "QUICK TOOLS",
    title: "MewMuze",
    body: "4 images stitched into one PDF. Saved to your Desktop.",
  },
};

export const featureStories: FeatureStory[] = stories.map((story) => ({
  ...story,
  helps: helps[story.id] ?? story.detail,
  notice: notices[story.id],
}));

export const featureGroups: FeatureGroup[] = [
  "Helps me work",
  "Keeps me on track",
  "Lives on my desktop",
  "Reacts to my day",
  "Looks like mine",
  "Respects my privacy",
];
