"use client";

import { useState, type ReactNode } from "react";
import { recordDownload } from "../lib/auth-api";
import { useAuth } from "./AuthProvider";

/**
 * A download link that asks for an account first.
 *
 * Signed in: the file opens and the download is recorded against the account.
 * Signed out: the sign in dialog opens, and the file follows once they are in.
 *
 * The installers are public release URLs, so this is a gate on the site, not on
 * the file itself. Pro is checked server side too: download-record.php refuses
 * an account with no paid purchase behind it.
 */
export function DownloadButton({
  href,
  edition,
  className = "",
  children,
}: {
  href: string;
  edition: "free" | "pro";
  className?: string;
  children: ReactNode;
}) {
  const { state, requestSignIn } = useAuth();
  const [refused, setRefused] = useState(false);
  const account = state.status === "ready" ? state.account : null;
  const signedIn = account?.user != null;
  // Always gated. If the account service is unreachable the dialog says so
  // rather than quietly handing the installer over.
  const gated = !signedIn;
  // Pro belongs to the account that paid for it. download-record.php refuses it
  // server side as well; this is so the link is not handed over in the first place.
  const missingPro = edition === "pro" && signedIn && account?.entitlements.pro === false;

  return (
    <>
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-haspopup={gated ? "dialog" : undefined}
        onClick={(event) => {
          if (state.status === "loading") {
            event.preventDefault();
            return;
          }
          if (gated) {
            event.preventDefault();
            requestSignIn({ edition, href });
            return;
          }
          if (missingPro) {
            event.preventDefault();
            setRefused(true);
            return;
          }
          if (signedIn) void recordDownload(edition);
        }}
      >
        {children}
      </a>
      {refused && (
        <p className="download-refused" role="alert">
          This account has no MewMuze Pro purchase yet. Log in with the email you used at checkout.
        </p>
      )}
    </>
  );
}
