"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { sitePath } from "../../../lib/site-path";

type PurchaseResult = {
  status: string;
  email: string;
  paymentId: string;
  licenseKey: string;
};

const emptyResult: PurchaseResult = {
  status: "",
  email: "",
  paymentId: "",
  licenseKey: "",
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
  "https://github.com/SpandRagon98/PawPico-Website/releases/download/v0.1.5/MewMuze_0.1.5_x64-setup.exe";

export default function CheckoutSuccess() {
  const [purchase, setPurchase] = useState<PurchaseResult>(emptyResult);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const licenseKey = (params.get("license_key") ?? "").split(",")[0].trim().slice(0, 400);
    const result = {
      status: (params.get("status") ?? "").slice(0, 40),
      email: (params.get("email") ?? "").slice(0, 200),
      paymentId: (params.get("payment_id") ?? "").slice(0, 100),
      licenseKey,
    };

    queueMicrotask(() => {
      if (active) setPurchase(result);
    });

    // Keep the key out of copied URLs and browser history after it has been read.
    if (licenseKey) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => {
      active = false;
    };
  }, []);

  const copyKey = async () => {
    if (!purchase.licenseKey) return;
    await navigator.clipboard.writeText(purchase.licenseKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const succeeded =
    purchase.status === "succeeded" ||
    purchase.status === "active" ||
    Boolean(purchase.licenseKey);

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
          {purchase.email
            ? `Dodo Payments is also sending the receipt and licence to ${purchase.email}.`
            : "Dodo Payments sends the receipt and licence to the email used at checkout."}
        </p>

        {purchase.licenseKey ? (
          <div className="license-delivery">
            <small>YOUR MEWMUZE LICENCE KEY</small>
            <code>{purchase.licenseKey}</code>
            <button className="skeuo-button skeuo-button-primary" type="button" onClick={copyKey}>
              {copied ? "Copied!" : "Copy licence key"}
            </button>
          </div>
        ) : (
          <div className="license-delivery is-waiting">
            <small>LICENCE DELIVERY</small>
            <strong>Check your purchase email.</strong>
            <p>
              If the payment succeeded but the key is not shown here, the email is the
              authoritative copy. Keep the receipt and payment ID for support.
            </p>
          </div>
        )}

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

        {succeeded && (
          <p className="install-note">
            The download is hosted on MewMuze&rsquo;s official GitHub releases page, so
            the file comes straight from the developer. Windows may still say{" "}
            <strong>&ldquo;Windows protected your PC&rdquo;</strong> when you open it,
            because MewMuze is not code signed yet. Choose <strong>More info</strong>,
            then <strong>Run anyway</strong>.
          </p>
        )}

        <div className="commerce-actions">
          {succeeded && (
            <a className="skeuo-button skeuo-button-primary" href={DOWNLOAD_URL}>
              Download MewMuze 0.1.5
            </a>
          )}
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
