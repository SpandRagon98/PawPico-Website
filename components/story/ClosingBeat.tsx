"use client";

import { commerce } from "../../lib/commerce";
import { DownloadButton } from "../DownloadButton";

/**
 * The last word, after the price. No features, just the two platforms: the
 * Windows build you can take now, and the macOS build that is still being
 * finished. The macOS button is deliberately inert rather than hidden, so the
 * page is honest about where it is without pretending the build exists.
 */
export function ClosingBeat() {
  return (
    <section className="closing-beat story-dark section-pad" id="close" data-nav-dark aria-labelledby="closing-title">
      <div className="section-shell closing-shell">
        <h2 id="closing-title">
          She is not going to fix your life.
          <br />
          <em>She is going to be there while you do.</em>
        </h2>
        <p>
          Some days that means splitting a PDF. Some days it means something small and warm moving
          in the corner of a screen at one in the morning. Both count.
        </p>
        <div className="closing-actions">
          <DownloadButton
            className="skeuo-button skeuo-button-primary closing-cta"
            href={commerce.freeDownloadUrl}
            edition="free"
          >
            Download Free <span aria-hidden="true">↓</span>
          </DownloadButton>
          <button className="skeuo-button closing-cta closing-cta-soon" type="button" disabled>
            Download for macOS
            <span className="closing-soon-pill" aria-hidden="true">
              Almost ready
            </span>
          </button>
        </div>
        <p className="closing-fineprint">
          Free to keep. Windows 10 and 11 today. The macOS build is in the workshop.
        </p>
      </div>
    </section>
  );
}
