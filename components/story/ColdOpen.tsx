/**
 * The cold open: the ache the rest of the page answers.
 *
 * Deliberately almost empty. Everything above it sells a product; this is the
 * one section that just sits with the reader for a moment, so that "she is
 * still up" lands instead of reading as another feature bullet.
 */
export function ColdOpen() {
  return (
    <section className="cold-open story-dark section-pad" id="late-night" data-nav-dark aria-labelledby="cold-open-title">
      <div className="section-shell cold-open-shell">
        <p className="cold-open-clock">
          <i aria-hidden="true" />
          2:14 AM
        </p>
        <h2 id="cold-open-title">
          The group chat died at eleven. Your feed is the same six people saying
          the same six things.
        </h2>
        <p className="cold-open-body">
          You are not sad exactly. Just awake, and slightly too alone for the hour,
          scrolling something you stopped enjoying about forty minutes ago.
        </p>
        <p className="cold-open-turn">She is still up.</p>
        <p className="cold-open-hint">KEEP SCROLLING</p>
      </div>
    </section>
  );
}
