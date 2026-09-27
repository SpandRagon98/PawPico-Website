import { sitePath } from "./site-path";

export type AccountUser = { email: string; name: string };
export type Entitlements = { free: boolean; pro: boolean };
export type Account = { user: AccountUser | null; entitlements: Entitlements };

/**
 * "unavailable" is its own state, not an error: the PHP endpoints only exist on
 * mewmuze.com, so a local preview or a static export opened from disk has no
 * account service at all. The UI says so rather than pretending sign in failed.
 */
export type AccountState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; account: Account };

export class AuthError extends Error {}

const SIGNED_OUT: Account = { user: null, entitlements: { free: false, pro: false } };

async function readAccount(response: Response): Promise<Account> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    throw new AuthError("Accounts are temporarily unavailable.");
  }
  const payload = body as { ok?: boolean; error?: string; user?: AccountUser | null; entitlements?: Entitlements };
  if (!response.ok || payload?.ok !== true) {
    throw new AuthError(payload?.error ?? "Something went wrong. Try again.");
  }
  return {
    user: payload.user ?? null,
    entitlements: payload.entitlements ?? SIGNED_OUT.entitlements,
  };
}

async function post(endpoint: string, body: Record<string, string>): Promise<Account> {
  const response = await fetch(sitePath(`/api/${endpoint}`), {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readAccount(response);
}

/** Never throws: a missing API means "no account service here", not a failure. */
export async function fetchAccount(): Promise<AccountState> {
  try {
    const response = await fetch(sitePath("/api/auth-session.php"), {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok && response.status !== 401) {
      return { status: "unavailable" };
    }
    return { status: "ready", account: await readAccount(response) };
  } catch {
    return { status: "unavailable" };
  }
}

export const signUp = (email: string, password: string, name: string) =>
  post("auth-signup.php", { email, password, name });

export const logIn = (email: string, password: string) => post("auth-login.php", { email, password });

export async function logOut(): Promise<Account> {
  try {
    return await post("auth-logout.php", {});
  } catch {
    return SIGNED_OUT;
  }
}

/** Records who took which build. A failure here must never block the download. */
export async function recordDownload(edition: "free" | "pro"): Promise<void> {
  try {
    await post("download-record.php", { edition });
  } catch {
    // Logged server side; the person still gets their installer.
  }
}
