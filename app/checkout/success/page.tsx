"use client";

import { useEffect, useState } from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { sitePath } from "../../../lib/site-path";

type PurchaseState = "pending" | "processing" | "fulfilled" | "revoked" | "error";

type PurchaseResult = { state: PurchaseState; paymentId: string };

const emptyResult: PurchaseResult = {
  state: "pending",
  paymentId: "",
};

/**
 * The installer lives on GitHub Releases, not in this repository.
 *
 * At ~5.7 MB a release it was the whole reason this repo had grown to tens of
 * megabytes and pushes had started timing out, and git never forgets a blob.
 * scripts/release.ps1 in the desktop repo rewrites this one line after it
 * publishes the asset, so the link and the release cannot drift apart.
 */
const DOWNLOAD_URL =
  "https://github.com/SpandRagon98/PawPico-Website/releases/download/v0.1.8/MewMuze_0.1.8_x64-setup.exe";

export default function CheckoutSuccess() {
  const [purchase, setPurchase] = useState<PurchaseResult>(emptyResult);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const params = new URLSearchParams(window.location.search);
    const paymentId = (params.get("payment_id") ?? "").trim().slice(0, 120);
    window.history.replaceState({}, "", window.location.pathname);

    if (!paymentId) {
      queueMicrotask(() => active && setPurchase({ state: "pending", paymentId: "" }));
      return () => {
        active = false;
      };
    }

    let attempts = 0;
    const verify = async () => {
      attempts += 1;
      try {
        const response = await fetch(
          sitePath(`/api/purchase-status.php?payment_id=${encodeURIComponent(paymentId)}`),
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("status unavailable");
        const body = (await response.json()) as { state?: PurchaseState; fulfilled?: boolean };
        const state: PurchaseState = body.fulfilled ? "fulfilled" : body.state ?? "pending";
        if (active) setPurchase({ state, paymentId });
        if (state !== "fulfilled" && state !== "revoked" && attempts < 10) {
          timer = window.setTimeout(() => void verify(), 3000);
        }
      } catch {
        if (active) setPurchase({ state: attempts < 10 ? "processing" : "error", paymentId });
        if (attempts < 10) timer = window.setTimeout(() => void verify(), 3000);
      }
    };
    void verify();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const succeeded = purchase.state === "fulfilled";

  return (
    <>
      <PublicHeader />
      <main className="commerce-page commerce-page-with-navigation commerce-success-page">
        <section className="commerce-card commerce-success-card" aria-live="polite">
          <header className="purchase-welcome">
            <div>
              <p className="eyebrow">
                <span aria-hidden="true" />
                {succeeded ? "PURCHASE COMPLETE" : "PURCHASE STATUS"}
              </p>
              <h1>
                {succeeded ? "Your pet is ready to come home." : "We are checking your purchase."}
              </h1>
              <p>
                You are three small steps away from meeting MewMuze. Keep this page open while
                you download, install and activate your desktop pet.
              </p>
            </div>

            <div className="license-delivery is-waiting">
              <small>{succeeded ? "LICENCE DELIVERED" : "VERIFIED FULFILMENT"}</small>
              <strong>
                {succeeded
                  ? "Payment verified — your key is in your Dodo Payments email."
                  : purchase.state === "revoked"
                    ? "This purchase is no longer active."
                    : "Dodo is confirming payment and generating your key."}
              </strong>
              <p>
                The installer is ready below. Your unique licence key arrives separately at the
                email address you used during checkout.
              </p>
            </div>
          </header>

          <div className="purchase-journey">
            <article className="purchase-step purchase-step-download">
              <span className="purchase-step-number" aria-hidden="true">01</span>
              <div className="purchase-step-copy">
                <p className="purchase-step-label">STEP 1</p>
                <h2>Download the MewMuze app</h2>
                <p>
                  Use the button below to download the official Windows installer. When the
                  download finishes, open <strong>MewMuze_0.1.8_x64-setup.exe</strong> to begin.
                </p>
                <a className="skeuo-button skeuo-button-primary" href={DOWNLOAD_URL}>
                  Download MewMuze 0.1.8
                </a>
                <small>For Windows 10 and 11 · downloaded from the official MewMuze release</small>
              </div>
            </article>

            <article className="purchase-step purchase-step-defender">
              <span className="purchase-step-number" aria-hidden="true">02</span>
              <div className="purchase-step-copy">
                <p className="purchase-step-label">STEP 2</p>
                <h2>Let Windows know you trust this download</h2>
                <p>
                  Windows Defender SmartScreen may show <strong>&ldquo;Windows protected your
                  PC&rdquo;</strong> because this young independent app does not have a paid
                  code-signing certificate yet. This is expected for the installer downloaded
                  from this page.
                </p>

                <div className="defender-walkthrough" aria-label="Windows Defender installation walkthrough">
                  <figure>
                    <div className="defender-shot defender-shot-pink">
                      <img
                        src={sitePath("/checkout/windows-defender-more-info.png")}
                        alt="Windows Defender SmartScreen warning with the More info link visible"
                        width="525"
                        height="495"
                      />
                    </div>
                    <figcaption><strong>First:</strong> select <em>More info</em>.</figcaption>
                  </figure>
                  <span className="walkthrough-arrow" aria-hidden="true">→</span>
                  <figure>
                    <div className="defender-shot defender-shot-yellow">
                      <img
                        src={sitePath("/checkout/windows-defender-run-anyway.png")}
                        alt="Expanded Windows Defender warning showing the MewMuze installer and Run anyway button"
                        width="525"
                        height="495"
                      />
                    </div>
                    <figcaption>
                      <strong>Then:</strong> confirm the app name and select <em>Run anyway</em>.
                    </figcaption>
                  </figure>
                </div>

                <aside className="founder-signing-note">
                  <span aria-hidden="true">♥</span>
                  <p>
                    MewMuze is just getting started as a tiny independent project. A trusted
                    Windows signing certificate has a real recurring cost that we cannot cover
                    yet. Your support helps us keep building—and gets us closer to removing this
                    extra screen from future releases. Thank you for believing in our little pet.
                  </p>
                </aside>
              </div>
            </article>

            <article className="purchase-step purchase-step-activate">
              <span className="purchase-step-number" aria-hidden="true">03</span>
              <div className="purchase-step-copy">
                <p className="purchase-step-label">STEP 3</p>
                <h2>Bring your licence key home</h2>
                <p>
                  After installation, MewMuze opens its activation window. You can minimize that
                  window, open your email, and look for a message from <strong>Dodo Payments</strong>.
                  Copy the unique licence key from that email, return to MewMuze, paste it into
                  the licence field and select <strong>Activate</strong>.
                </p>
                <ol className="activation-checklist">
                  <li><span>1</span> Minimize the activation window.</li>
                  <li><span>2</span> Open the Dodo Payments email and copy your licence key.</li>
                  <li><span>3</span> Return to MewMuze, paste the key and select Activate.</li>
                </ol>
                <p className="activation-help-note">
                  No email yet? Check Spam or Promotions first, then visit Purchase help below.
                </p>
              </div>
            </article>
          </div>

          {purchase.paymentId && (
            <p className="purchase-reference">
              Purchase reference: <code>{purchase.paymentId}</code>
            </p>
          )}

          <footer className="commerce-actions purchase-footer-actions">
            <a className="skeuo-button skeuo-button-secondary" href={sitePath("/")}>
              Back to MewMuze
            </a>
            <a className="skeuo-button skeuo-button-quiet" href={sitePath("/support/")}>
              Purchase help
            </a>
          </footer>
        </section>
      </main>
    </>
  );
}
