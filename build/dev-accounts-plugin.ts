import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * The account endpoints, for the dev server only.
 *
 * In production these are the PHP files in `hostinger-api/` talking to MySQL on
 * Hostinger. There is no PHP in front of Vite, so without this the sign in gate
 * could not be used or reviewed locally at all.
 *
 * Deliberately in-memory and deliberately `apply: "serve"`: nothing here is
 * built, exported or deployed, and every account disappears when the dev server
 * restarts. It exists so the flow can be clicked through, not to be a database.
 */

type DevUser = { email: string; password: string; name: string };

const PRO_SUFFIX = "+pro";

export function devAccounts(): Plugin {
  const users = new Map<string, DevUser>();
  const sessions = new Map<string, string>();

  /** Locally, any address containing "+pro" is treated as having bought Pro. */
  const hasPro = (email: string) => email.includes(PRO_SUFFIX);

  const account = (email: string) => ({
    ok: true,
    user: { email, name: users.get(email)?.name ?? "" },
    entitlements: { free: true, pro: hasPro(email) },
  });

  const signedOut = { ok: true, user: null, entitlements: { free: false, pro: false } };

  const send = (res: ServerResponse, status: number, body: unknown, cookie?: string) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    if (cookie) res.setHeader("Set-Cookie", cookie);
    res.end(JSON.stringify(body));
  };

  const readJson = (req: IncomingMessage) =>
    new Promise<Record<string, string>>((resolve) => {
      let raw = "";
      req.on("data", (chunk) => {
        raw += chunk;
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(raw || "{}"));
        } catch {
          resolve({});
        }
      });
    });

  const tokenOf = (req: IncomingMessage) =>
    /mewmuze_session=([a-f0-9]+)/.exec(req.headers.cookie ?? "")?.[1] ?? "";

  const newToken = () => Math.random().toString(16).slice(2).padEnd(64, "0").slice(0, 64);

  return {
    name: "mewmuze-dev-accounts",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? "").split("?")[0];
        if (!path.startsWith("/api/")) return next();

        const body = req.method === "POST" ? await readJson(req) : {};
        const email = String(body.email ?? "").trim().toLowerCase();
        const password = String(body.password ?? "");

        if (path === "/api/auth-session.php") {
          const who = sessions.get(tokenOf(req));
          return send(res, 200, who ? account(who) : signedOut);
        }

        if (path === "/api/auth-signup.php") {
          if (!email.includes("@")) {
            return send(res, 400, { ok: false, error: "Enter a valid email address." });
          }
          if (password.length < 10) {
            return send(res, 400, { ok: false, error: "Use a password of at least 10 characters." });
          }
          if (users.has(email)) {
            return send(res, 409, { ok: false, error: "That email already has an account. Log in instead." });
          }
          users.set(email, { email, password, name: String(body.name ?? "") });
          const token = newToken();
          sessions.set(token, email);
          return send(res, 201, account(email), `mewmuze_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
        }

        if (path === "/api/auth-login.php") {
          const found = users.get(email);
          if (!found || found.password !== password) {
            return send(res, 401, { ok: false, error: "Email or password is incorrect." });
          }
          const token = newToken();
          sessions.set(token, email);
          return send(res, 200, account(email), `mewmuze_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
        }

        if (path === "/api/auth-logout.php") {
          sessions.delete(tokenOf(req));
          return send(res, 200, signedOut, "mewmuze_session=; Path=/; Max-Age=0");
        }

        if (path === "/api/download-record.php") {
          const who = sessions.get(tokenOf(req));
          if (!who) return send(res, 401, { ok: false, error: "Sign in to download." });
          if (body.edition === "pro" && !hasPro(who)) {
            return send(res, 403, { ok: false, error: "This account has no MewMuze Pro purchase yet." });
          }
          server.config.logger.info(`[dev accounts] ${who} downloaded ${body.edition}`);
          return send(res, 200, { ok: true });
        }

        return next();
      });
    },
  };
}
