/**
 * One day, start to finish. This is the section that answers "how does she
 * actually enhance my day" in a single screen, and every beat maps to a real
 * behaviour elsewhere on the page rather than a mood board.
 */
const beats = [
  {
    time: "08:10",
    title: "You sit down. She stretches.",
    line: "No dashboard, no good morning streak. She just wakes up when you do and gets on with it.",
  },
  {
    time: "11:30",
    title: "Work mode, actual silence.",
    line: "She parks beside your files, stops chasing the cursor and lets you cook.",
  },
  {
    time: "15:45",
    title: "The slump. She clocks it.",
    line: "Two hours without moving and she is on the glass telling you to drink water and unclench your jaw.",
  },
  {
    time: "19:20",
    title: "You close the laptop.",
    line: "She wraps the day up. What happened, what is next, no score out of ten.",
  },
  {
    time: "01:06",
    title: "Still there.",
    line: "Nothing to log into, no streak to protect, nobody to perform for. She is just on.",
  },
];

export function DayWithHer() {
  return (
    <section className="day-with-her section-pad" id="day" aria-labelledby="day-title">
      <div className="section-shell">
        <header className="day-head">
          <p className="eyebrow">
            <span aria-hidden="true" />
            ONE ORDINARY TUESDAY
          </p>
          <h2 id="day-title">
            She is not an app you open.
            <br />
            <em>She is just around.</em>
          </h2>
          <p>
            Most software wants your attention. She wants about four seconds of it, at the
            moments that actually help, and then she goes back to being a cat on your screen.
          </p>
        </header>

        <ol className="day-track">
          {beats.map((beat) => (
            <li key={beat.time} className="day-beat">
              <time>{beat.time}</time>
              <h3>{beat.title}</h3>
              <p>{beat.line}</p>
            </li>
          ))}
        </ol>

        <p className="day-note">
          None of this needs an account, a subscription or a connection. She reads the clock and
          your own activity on your own machine, and that is the whole input.
        </p>
      </div>
    </section>
  );
}
