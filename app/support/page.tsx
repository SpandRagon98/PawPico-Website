import Image from "next/image";
import { sitePath } from "../../lib/site-path";

export default function Support() {
  return (
    <main className="commerce-page">
      <a className="commerce-brand" href={sitePath("/")} aria-label="MewMuze home">
        <span>
          <Image
            src={sitePath("/cat/mewmuze-face-logo-hd.png")}
            alt=""
            width={512}
            height={512}
            unoptimized
          />
        </span>
        <strong>MewMuze</strong>
      </a>
      <section className="commerce-card">
        <p className="eyebrow">
          <span aria-hidden="true" />
          PURCHASE &amp; LICENCE HELP
        </p>
        <h1>We will help you bring your cat home.</h1>
        <p>
          Keep your Dodo Payments receipt nearby. For a missing email, mistyped
          address, activation-limit issue, refund, or licence problem, include the
          payment ID and the email used at checkout. Never send a card number.
        </p>
        <div className="support-options">
          <article>
            <small>PAYMENT OR LICENCE</small>
            <strong>Email MewMuze support</strong>
            <p>Include your payment ID and checkout email so the purchase can be found.</p>
            <a href="mailto:support@mewmuze.com?subject=MewMuze%20purchase%20help">
              support@mewmuze.com
            </a>
          </article>
          <article>
            <small>KEY DID NOT ARRIVE</small>
            <strong>Check spam, then the receipt</strong>
            <p>
              Dodo delivers the licence after a successful payment. The purchase
              reference lets support recover it without seeing payment details.
            </p>
          </article>
        </div>
        <div className="commerce-actions">
          <a className="skeuo-button skeuo-button-secondary" href={sitePath("/")}>
            Back to MewMuze
          </a>
        </div>
      </section>
    </main>
  );
}
