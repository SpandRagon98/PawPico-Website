export interface CheckoutSession {
  sessionId: string;
  productId: string;
  mode: "mock";
  status: "pending" | "paid";
}

export interface InstallationToken {
  token: string;
  installUrl: string;
  expiresAt: number;
}

export interface CommerceProvider {
  createCheckoutSession(productId: string, userContext?: { userId?: string }): Promise<CheckoutSession>;
  getPurchaseStatus(sessionId: string): Promise<CheckoutSession["status"]>;
  getOwnedCostumes(userId?: string): Promise<string[]>;
  createInstallationToken(costumeSlug: string): Promise<InstallationToken>;
  refreshInstallationToken(token: string): Promise<InstallationToken>;
  requestSignedDownload(costumeId: string): Promise<{ url: string; expiresAt: number }>;
}

const LIBRARY_KEY = "mewmuze.mock-owned-costumes.v1";
const SESSION_KEY = "mewmuze.mock-checkout-sessions.v1";

function randomNonce(): string {
  return crypto.getRandomValues(new Uint32Array(2)).join("");
}

function readStringArray(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readSessions(): CheckoutSession[] {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export class MockCommerceProvider implements CommerceProvider {
  async createCheckoutSession(productId: string): Promise<CheckoutSession> {
    const session: CheckoutSession = {
      sessionId: `mock_checkout_${Date.now()}_${randomNonce()}`,
      productId,
      mode: "mock",
      status: "pending",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify([...readSessions(), session]));
    return session;
  }

  async completeCheckout(sessionId: string): Promise<void> {
    const sessions = readSessions();
    const session = sessions.find((item) => item.sessionId === sessionId);
    if (!session) throw new Error("That mock checkout session was not found.");
    session.status = "paid";
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    const owned = Array.from(new Set([...readStringArray(LIBRARY_KEY), session.productId]));
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(owned));
  }

  async getPurchaseStatus(sessionId: string): Promise<CheckoutSession["status"]> {
    return readSessions().find((item) => item.sessionId === sessionId)?.status ?? "pending";
  }

  async getOwnedCostumes(): Promise<string[]> {
    return readStringArray(LIBRARY_KEY);
  }

  async createInstallationToken(costumeSlug: string): Promise<InstallationToken> {
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60;
    const token = `mock_${costumeSlug}_${expiresAt}_${randomNonce()}`;
    return { token, expiresAt, installUrl: `mewmuze://install-costume?token=${token}` };
  }

  async refreshInstallationToken(token: string): Promise<InstallationToken> {
    const parts = token.split("_");
    if (parts.length !== 4 || parts[0] !== "mock") {
      throw new Error("That mock installation token is invalid.");
    }
    return this.createInstallationToken(parts[1]);
  }

  async requestSignedDownload(): Promise<{ url: string; expiresAt: number }> {
    throw new Error("Signed product downloads require the production Store backend.");
  }
}

export const mockCommerce = new MockCommerceProvider();
