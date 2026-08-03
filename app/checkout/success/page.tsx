"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

      <section className="commerce-card" aria-live="polite">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {succeeded ? "PURCHASE COMPLETE" : "PURCHASE STATUS"}
        </p>
        <h1>{succeeded ? "Your cat is ready to come home." : "We are checking your purchase."}</h1>
        <p>
          Dodo Payments sends the receipt and unique licence key to the email used at checkout.
        </p>

        <div className="license-delivery is-waiting">
          <small>{succeeded ? "LICENCE DELIVERED" : "VERIFIED FULFILMENT"}</small>
          <strong>
            {succeeded
              ? "Payment verified — check your purchase email for the key."
              : purchase.state === "revoked"
                ? "This purchase is no longer active."
                : "Dodo is confirming payment and generating your key."}
          </strong>
          <p>
            Your installer is available below while Dodo finishes confirming the purchase.
            The unique licence key is delivered separately to your purchase email.
          </p>
        </div>

        <ol className="activation-steps">
          <li>Open MewMuze on the computer you want to activate.</li>
          <li>Open Cat Settings and paste the key into the licence box.</li>
          <li>Select Unlock. The key is then kept in your system credential vault.</li>
        </ol>

        {purchase.paymentId && (
          <p className="purchase-reference">
            Purchase reference: <code>{purchase.paymentId}</code>
          </p>
        )}

        <p className="install-note">
          The download is hosted on MewMuze&rsquo;s official GitHub releases page, so
          the file comes straight from the developer. Windows may still say{" "}
          <strong>&ldquo;Windows protected your PC&rdquo;</strong> when you open it,
          because MewMuze is not code signed yet. Choose <strong>More info</strong>,
          then <strong>Run anyway</strong>.
        </p>

        <div className="commerce-actions">
          <a className="skeuo-button skeuo-button-primary" href={DOWNLOAD_URL}>
            Download MewMuze 0.1.8
          </a>
          <a className="skeuo-button skeuo-button-secondary" href={sitePath("/")}>
            Back to MewMuze
          </a>
          <a className="skeuo-button skeuo-button-quiet" href={sitePath("/support/")}>
            Purchase help
          </a>
        </div>
      </section>
    </main>
  );
}
