"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { recordDownload } from "../lib/auth-api";
import { sitePath } from "../lib/site-path";
import { useAuth } from "./AuthProvider";

/**
 * Sign up / log in, in one dialog. Opened by any gated download button, and by
 * the Account control in the navigation.
 *
 * The password never leaves this component except in the request body; nothing
 * is written to localStorage, and the session lives in an HttpOnly cookie the
 * page cannot read.
 */
export function AuthDialog() {
  const { dialogOpen } = useAuth();
  // Mounted only while open, so every field and error resets on each visit
  // rather than being cleared by an effect.
  return dialogOpen ? <AuthDialogBody /> : null;
}

function AuthDialogBody() {
  const { closeDialog, intent, state, signUp, logIn } = useAuth();
  // Arriving from a download button means most people are here for the first
  // time, so start on Sign up. Opening it from the nav starts on Log in.
  const [mode, setMode] = useState<"login" | "signup">(intent ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDialog]);

  const unavailable = state.status === "unavailable";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") await signUp(email, password, name);
      else await logIn(email, password);
      // The download the person was after, now that they are signed in. Recorded
      // here too, so a download taken through the dialog is not missed.
      if (intent) {
        void recordDownload(intent.edition);
        window.open(intent.href, "_blank", "noopener,noreferrer");
      }
      closeDialog();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-backdrop" role="presentation" onClick={(event) => {
      if (event.target === event.currentTarget) closeDialog();
    }}>
      <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={closeDialog} aria-label="Close">
          ×
        </button>

        <span className="auth-badge" aria-hidden="true">
          <Image src={sitePath("/cat/mewmuze-face-logo-hd.png")} alt="" width={512} height={512} unoptimized />
        </span>

        <p className="auth-eyebrow">
          <span aria-hidden="true" />
          {intent ? (intent.edition === "pro" ? "MEWMUZE PRO DOWNLOAD" : "MEWMUZE FREE DOWNLOAD") : "YOUR ACCOUNT"}
        </p>
        <h2 id="auth-title">
          {mode === "signup" ? (
            <>
              One quick form.
              <br />
              <em>Then she is yours.</em>
            </>
          ) : (
            <>
              Welcome back.
              <br />
              <em>She missed you.</em>
            </>
          )}
        </h2>
        <p className="auth-sub">
          {intent
            ? "Downloads are tied to an account, so you can find your build and your licence again later."
            : "One account for your downloads and your Pro licence."}
        </p>

        {unavailable ? (
          <p className="auth-notice" role="status">
            Accounts run on mewmuze.com. This preview has no account service, so sign in is not available
            here.
          </p>
        ) : (
          <>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "is-active" : ""}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={mode === "signup" ? "is-active" : ""}
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={submit}>
              {mode === "signup" && (
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    autoComplete="name"
                    maxLength={180}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Optional"
                  />
                </label>
              )}
              <label>
                <span>Email</span>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  required
                  minLength={mode === "signup" ? 10 : undefined}
                  value={password}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  maxLength={200}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {mode === "signup" && <small className="auth-hint">At least 10 characters.</small>}

              {error && <p className="auth-error" role="alert">{error}</p>}

              <button className="skeuo-button skeuo-button-primary auth-submit" type="submit" disabled={busy}>
                {busy ? "One moment..." : mode === "signup" ? "Create account" : "Log in"}
              </button>
            </form>

            <p className="auth-fineprint">
              Buying Pro is separate and still happens through our payment provider. Your password is
              stored only as a hash and we never see it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
