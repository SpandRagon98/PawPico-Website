/**
 * The trust beat, placed after the emotional sections rather than before them.
 *
 * Once the page has said "tell her about your day", the next thought is "where
 * does that go". Every line here is a claim the app can actually stand behind.
 */
const receipts = [
  {
    title: "No account to make her work",
    line: "The pet, the tools and the timers run whether or not you ever sign in. The website account only gates the download.",
  },
  {
    title: "Nothing is uploaded",
    line: "Your files, your notes and anything you say to her stay on your machine. There is no server holding a copy.",
  },
  {
    title: "She never reads your screen",
    line: "She knows the app category you are in and whether you are busy. Not your text, not your keys, not your windows, not your tabs.",
  },
  {
    title: "You are not training anything",
    line: "What she learns about your hours is arithmetic on your own PC. It is not sent anywhere and it is not a model.",
  },
  {
    title: "Forget it whenever you like",
    line: "Everything she remembers is listed in Settings, item by item, and every one of them has a delete.",
  },
];

export function Receipts() {
  return (
    <section className="receipts section-pad" id="private" aria-labelledby="receipts-title">
      <div className="section-shell receipts-shell">
        <div className="receipts-copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            RECEIPTS
          </p>
          <h2 id="receipts-title">
            She runs on your computer.
            <br />
            <em>That is the whole trick.</em>
          </h2>
          <p>
            Every other thing that promises to be there for you wants a login first and your data
            second. She does not, because there is nowhere for any of it to go.
          </p>
        </div>

        <ul className="receipts-list">
          {receipts.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
