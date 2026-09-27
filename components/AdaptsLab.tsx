"use client";

/**
 * How the Paper build adapts to the person using it.
 *
 * Every line here maps to something real in the app: habits.ts (busy share per
 * hour), routine.ts (when you start and finish, weekdays and weekends learned
 * apart), persona/style.ts (how you write), mood.ts (the room she reads in
 * chat), followUps.ts (check-ins from a fixed list of kinds), away.ts (real
 * absences), memory.ts (the four preferences she may keep). The learning is
 * arithmetic on this machine, and the privacy line at the end is the one the
 * source files state: never typed text, key names, window titles, screen
 * contents, websites or files.
 */

const beats = [
  {
    id: "hours",
    kicker: "YOUR HOURS",
    title: "She learns when you are heads down",
    line: "Every hour of the day gets a simple busy or not busy average, built up over days.",
    points: [
      "Calmer in the hours you usually grind",
      "Livelier in the hours you are usually free",
      "Needs about three days before it changes anything",
    ],
  },
  {
    id: "routine",
    kicker: "YOUR ROUTINE",
    title: "She works out your start and your finish",
    line: "When you usually get going and when you usually stop, with weekdays and weekends kept apart.",
    points: [
      "A wrap up near the time you actually finish",
      "Never a report card, never a score",
      "Quiet until there are about five days of it",
    ],
  },
  {
    id: "style",
    kicker: "YOUR VOICE",
    title: "She picks up how you talk",
    line: "Message length, casual or formal, jokes, emoji, straight answers, English, Hindi or Hinglish.",
    points: [
      "Short texter? She keeps it short",
      "Ask her to stop with the questions and she stops",
      "Anything you set yourself always wins",
    ],
  },
  {
    id: "room",
    kicker: "THE ROOM",
    title: "She reads the mood, not a label",
    line: "How you seem right now nudges how she reacts, then fades within minutes of the chat ending.",
    points: [
      "Never stored, never a diagnosis",
      "Rough day yesterday? She checks in once, gently",
      "Back after a real break? Welcome back, plus a recap only if something happened",
    ],
  },
];

export function AdaptsLab() {
  return (
    <section className="adapts-lab section-pad" id="adapts" data-nav-dark aria-labelledby="adapts-title">
      <div className="section-shell adapts-shell">
        <header className="adapts-head">
          <span className="liquid-kicker">PAPER PREVIEW · SHE ADAPTS TO YOU</span>
          <h2 id="adapts-title">
            She gets the hang of you.
            <br />
            <em>On your computer only.</em>
          </h2>
          <p>
            Nothing here is a profile in the cloud. It is a handful of averages kept on your machine, and
            the longer you use her the better the timing gets.
          </p>
        </header>

        <ol className="adapts-grid">
          {beats.map((beat, index) => (
            <li key={beat.id} className={`adapts-card adapts-card-${beat.id}`}>
              <span className="adapts-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="adapts-kicker">{beat.kicker}</span>
              <h3>{beat.title}</h3>
              <p>{beat.line}</p>
              <ul>
                {beat.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="adapts-privacy">
          <strong>What she never records:</strong> what you type, which keys you press, window titles,
          what is on your screen, the websites you visit or the files you open. The learning is plain
          arithmetic, no model involved, and none of it leaves your computer. Everything she remembers is
          listed in Settings and you can forget any of it.
        </p>
        <p className="adapts-note">
          Adaptive behaviour is part of the MewMuze Pro Paper build. It is not included in the current
          Free or Pro downloads.
        </p>
      </div>
    </section>
  );
}
