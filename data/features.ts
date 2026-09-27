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
  group: FeatureGroup;
  /** One line: what it is. Everything else is bullets. */
  story: string;
  video: string;
  accent: "mint" | "pink" | "lavender" | "blue" | "peach" | "yellow";
  /** What it actually does for you, in short pointers. */
  helps: string[];
  notice?: FeatureNotice;
  /** Shown only when a feature's edition is explicitly known. */
  availability?: {
    free?: boolean;
    pro?: boolean;
    /** In the Paper build only: not in the current Free or Pro downloads. */
    paper?: boolean;
  };
};

const stories: Omit<FeatureStory, "helps" | "notice">[] = [
  {
    id: "cursor",
    number: "01",
    title: "Cursor companion",
    group: "Lives on my desktop",
    story: "She clocks your cursor and sometimes decides it is prey.",
    video: "/videos/touch-and-mochi.mp4",
    accent: "mint",
  },
  {
    id: "petting",
    number: "02",
    title: "Petting",
    group: "Reacts to my day",
    story: "Stroke her and she melts. Grab her too much and she gets attitude.",
    video: "/videos/gaze-and-purr.mp4",
    accent: "pink",
  },
  {
    id: "sleep",
    number: "03",
    title: "Doze and sleep",
    group: "Reacts to my day",
    story: "You go quiet, she yawns, curls up and taps out.",
    video: "/videos/yawn-and-sleep.mp4",
    accent: "lavender",
  },
  {
    id: "work",
    number: "04",
    title: "Work Mode",
    group: "Helps me work",
    story: "A tiny PDF and image toolkit parks right next to her.",
    video: "/videos/work-mode.mp4",
    accent: "yellow",
    availability: { pro: true },
  },
  {
    id: "spreadsheets",
    number: "05",
    title: "Spreadsheet Tools",
    group: "Helps me work",
    story: "CSV and Excel jobs that usually cost you a sketchy website.",
    video: "/videos/mewmuze-quick-tools.mp4",
    accent: "mint",
    availability: { pro: true },
  },
  {
    id: "clipboard",
    number: "06",
    title: "Clipboard Assistant",
    group: "Helps me work",
    story: "The thing you copied, still there two steps later.",
    video: "/videos/context-companion.mp4",
    accent: "blue",
    availability: { pro: true },
  },
  {
    id: "focus",
    number: "07",
    title: "Focus Mode",
    group: "Keeps me on track",
    story: "She sits down and locks in with you. No chasing, no noise.",
    video: "/videos/focus-and-agent.mp4",
    accent: "mint",
  },
  {
    id: "pomodoro",
    number: "08",
    title: "Pomodoro",
    group: "Keeps me on track",
    story: "25 on, 5 off, repeat. Your attention span, but structured.",
    video: "/videos/focus-tools.mp4",
    accent: "peach",
  },
  {
    id: "breaks",
    number: "09",
    title: "Break and water reminders",
    group: "Keeps me on track",
    story: "Drink water. Unclench your jaw. Stand up. She is not asking.",
    video: "/videos/smart-notifications.mp4",
    accent: "blue",
  },
  {
    id: "reminders",
    number: "10",
    title: "Custom reminders",
    group: "Keeps me on track",
    story: "Your own nudges, in your own words, from a face you like.",
    video: "/videos/notices-motion.mp4",
    accent: "pink",
  },
  {
    id: "tasks",
    number: "11",
    title: "Tasks",
    group: "Keeps me on track",
    story: "A day list with subtasks, times and zero guilt trips.",
    video: "/videos/mewmuze-tasks.mp4",
    accent: "lavender",
    availability: { paper: true },
  },
  {
    id: "gmail",
    number: "12",
    title: "Gmail",
    group: "Helps me work",
    story: "New mail arrives as one tiny card. Sender and subject, that is it.",
    video: "/videos/gmail-connector.mp4",
    accent: "mint",
    availability: { pro: true },
  },
  {
    id: "calendar",
    number: "13",
    title: "Google Calendar",
    group: "Helps me work",
    story: "She taps the glass before the call, not four minutes after it.",
    video: "/videos/calendar-connector.mp4",
    accent: "yellow",
    availability: { pro: true },
  },
  {
    id: "physics",
    number: "14",
    title: "Desktop Physics",
    group: "Lives on my desktop",
    story: "Your real windows are the floor. She walks, hops and hangs off them.",
    video: "/videos/desktop-physics.mp4",
    accent: "lavender",
  },
  {
    id: "context",
    number: "15",
    title: "Context aware",
    group: "Reacts to my day",
    story: "Open an editor, glasses appear. Type hard, she starts steaming.",
    video: "/videos/context-companion.mp4",
    accent: "blue",
  },
  {
    id: "music",
    number: "16",
    title: "Music",
    group: "Reacts to my day",
    story: "Your playlist starts, she starts bopping.",
    video: "/videos/music-and-singing.mp4",
    accent: "pink",
  },
  {
    id: "microphone",
    number: "17",
    title: "Microphone reaction",
    group: "Reacts to my day",
    story: "Mic goes live, she sings along and bows when the call ends.",
    video: "/videos/music-and-singing.mp4",
    accent: "peach",
  },
  {
    id: "feelings",
    number: "18",
    title: "Feelings engine",
    group: "Reacts to my day",
    story: "29 moods, and yes, the savage ones are in there.",
    video: "/videos/mewmuze-emotions.mp4",
    accent: "mint",
    availability: { paper: true },
  },
  {
    id: "chat",
    number: "19",
    title: "Local Chat",
    group: "Reacts to my day",
    story: "Talk to her. Pick the energy: comfort, rant, savage, calm.",
    video: "/videos/mewmuze-chat-demo.mp4",
    accent: "blue",
    availability: { paper: true },
  },
  {
    id: "diary",
    number: "20",
    title: "Diary",
    group: "Reacts to my day",
    story: "A private page for the day, kept on your machine.",
    video: "/videos/mewmuze-chat-demo.mp4",
    accent: "pink",
    availability: { paper: true },
  },
  {
    id: "adapts",
    number: "21",
    title: "Adapts to you",
    group: "Reacts to my day",
    story: "She learns your hours and how you talk. Slowly, and only on this PC.",
    video: "/videos/rest-and-emotion.mp4",
    accent: "lavender",
    availability: { paper: true },
  },
  {
    id: "voice",
    number: "22",
    title: "Voice to text",
    group: "Helps me work",
    story: "Hold the key, talk, she types it out.",
    video: "/videos/music-and-singing.mp4",
    accent: "peach",
    availability: { paper: true },
  },
  {
    id: "appearance",
    number: "23",
    title: "Appearance Studio",
    group: "Looks like mine",
    story: "Build the cat. Body, coat, colours, size.",
    video: "/videos/customization-studio.mp4",
    accent: "pink",
  },
  {
    id: "costumes",
    number: "24",
    title: "Built-in costumes",
    group: "Looks like mine",
    story: "Corporate Cat, Cyberpunk Cat, Bat Cat. Pick a fit, pick a colour.",
    video: "/videos/costume-cyberpunk.mp4",
    accent: "yellow",
    availability: { pro: true },
  },
  {
    id: "personality",
    number: "25",
    title: "Personality and rest",
    group: "Looks like mine",
    story: "Energy drains, moods stick, affection is remembered. Not a looping GIF.",
    video: "/videos/rest-and-emotion.mp4",
    accent: "lavender",
  },
  {
    id: "peek",
    number: "26",
    title: "Peek Mode",
    group: "Lives on my desktop",
    story: "Sharing your screen? She ducks out of frame on her own.",
    video: "/videos/desktop-roaming.mp4",
    accent: "mint",
  },
  {
    id: "agent",
    number: "27",
    title: "Local Agent Status",
    group: "Respects my privacy",
    story: "Point her at one local status file and she reacts to your build.",
    video: "/videos/focus-and-agent.mp4",
    accent: "yellow",
  },
  {
    id: "lightweight",
    number: "28",
    title: "Lightweight Windows companion",
    group: "Respects my privacy",
    story: "Lively when you look, near still when you do not.",
    video: "/mewmuze-idle-reel.mp4",
    accent: "blue",
  },
  {
    id: "calculator",
    number: "29",
    title: "Calculator",
    group: "Helps me work",
    story: "Quick sums without opening a browser tab you will forget to close.",
    video: "/videos/work-mode.mp4",
    accent: "yellow",
    availability: { free: true, pro: true },
  },
  {
    id: "unit-converter",
    number: "30",
    title: "Unit Converter",
    group: "Helps me work",
    story: "Km to miles, grams to cups, done in one little panel.",
    video: "/videos/work-mode.mp4",
    accent: "mint",
    availability: { free: true, pro: true },
  },
  {
    id: "time-converter",
    number: "31",
    title: "Time Zone Converter",
    group: "Helps me work",
    story: "What time it is in Tokyo, without the mental maths.",
    video: "/videos/work-mode.mp4",
    accent: "blue",
    availability: { free: true, pro: true },
  },
];

/** The payoff, in pointers. Short lines only: this is the part people skim. */
const helps: Record<string, string[]> = {
  cursor: [
    "Move the mouse, she looks up",
    "Hover near her and she comes over",
    "Playful profiles chase more, calm ones stay put",
  ],
  petting: [
    "Stroke back and forth for purrs and hearts",
    "Hovering does not count, the gesture has to be real",
    "Keep grabbing her and she gets annoyed",
  ],
  sleep: [
    "Real inactivity, not just a timer",
    "Full yawn, then a curl up",
    "Movement nearby wakes her",
  ],
  work: [
    "Images into one PDF, PDF back into images",
    "Runs on your machine, no upload",
    "Panel parks on her clearest side",
  ],
  spreadsheets: [
    "CSV to Excel and back",
    "Merge many sheets into one file",
    "Split a workbook into tidy separate files",
  ],
  clipboard: [
    "Keeps what you actually copied",
    "Never reads the screen behind it",
    "Pet sized, not another giant window",
  ],
  focus: [
    "Count up timer, no shame bar",
    "Chasing pauses while you work",
    "Small cheers on the long runs",
  ],
  pomodoro: [
    "Set focus, short break, long break",
    "Pause, resume, skip, reset",
    "One broken session does not kill the day",
  ],
  breaks: [
    "Stretch and water nudges",
    "Counts active use, not wall clock",
    "Snooze it if you are mid thought",
  ],
  reminders: [
    "One offs or repeats, your wording",
    "Warns you before it is due",
    "Snooze or mark it done",
  ],
  tasks: [
    "Subtasks, times and a done count",
    "See the day without opening an app",
    "No streaks, no scores, no guilt",
  ],
  gmail: [
    "Newest sender and subject only",
    "She never opens the email body",
    "App password you can revoke anytime",
  ],
  calendar: [
    "Private iCal link, parsed on your PC",
    "Warning up to 120 minutes ahead",
    "Five minute snooze when you need it",
  ],
  physics: [
    "Walks window tops and the taskbar",
    "Clings to edges and falls with drama",
    "Knows multiple monitors",
  ],
  context: [
    "Reads the app category, never your screen",
    "Different pose for writing, coding, reading",
    "No typed text, ever",
  ],
  music: [
    "Knows something is playing, nothing else",
    "No title, artist or artwork",
    "Headphones and a bop",
  ],
  microphone: [
    "Knows the mic went live",
    "Nothing is opened, recorded or transcribed",
    "Bows when the call ends",
  ],
  feelings: [
    "29 expressions across the whole range",
    "Savage, angry and sad included",
    "She types when you type and sings when you sing",
  ],
  chat: [
    "Runs on your computer, not a server",
    "Personas: comfort, rant, savage, calm and more",
    "New chat or forget chat whenever you want",
  ],
  diary: [
    "Write the day down beside her",
    "Stays on your machine",
    "Nothing is posted anywhere",
  ],
  adapts: [
    "Learns the hours you are usually heads down",
    "Picks up how long and how casual you write",
    "Plain arithmetic on your PC, no model, no upload",
  ],
  voice: [
    "Push to talk, she types it",
    "Transcribed on your own machine",
    "Raw and cleaned versions both kept",
  ],
  appearance: [
    "Five body plans, seven coat patterns",
    "Colours you pick, three display sizes",
    "Match a real pet or invent one",
  ],
  costumes: [
    "Three fits included with Pro",
    "Six suit, five jacket or five accent colours",
    "Drawn live on her body, so it moves with her",
  ],
  personality: [
    "Energy drains and recovers",
    "Moods carry over between sessions",
    "March her behaves like a pet you have lived with",
  ],
  peek: [
    "Spots full screen and presentations",
    "Retreats to a corner peek",
    "Comes back when there is room",
  ],
  agent: [
    "One file path you type in yourself",
    "Off until you set it",
    "Thinks, runs, waits, celebrates",
  ],
  lightweight: [
    "Frame rate drops when you are not looking",
    "Clicks pass through to what is underneath",
    "No taskbar clutter, Windows 10 and 11",
  ],
  calculator: [
    "Everyday sums, instantly",
    "Local, no account, works offline",
    "Stays next to the work that prompted it",
  ],
  "unit-converter": [
    "Two cards, side by side",
    "Common everyday units",
    "No website, no cookie banner",
  ],
  "time-converter": [
    "Two cities on screen at once",
    "No offset maths in your head",
    "Sorted before you send the invite",
  ],
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
  helps: helps[story.id] ?? [],
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
