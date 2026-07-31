import Image from "next/image";
import { sitePath } from "../../../lib/site-path";

export default function CheckoutCancelled() {
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
          CHECKOUT CLOSED
        </p>
        <h1>Nothing was charged.</h1>
        <p>
          Your checkout was cancelled safely. You can return to the one-time price
          whenever you are ready.
        </p>
        <div className="commerce-actions">
          <a className="skeuo-button skeuo-button-primary" href={sitePath("/#pricing")}>
            Return to the price
          </a>
          <a className="skeuo-button skeuo-button-quiet" href={sitePath("/")}>
            Back home
          </a>
        </div>
      </section>
    </main>
  );
}
