export type CommerceMode = "test" | "live";

export const TEST_DODO_PRODUCT_ID = "pdt_0NkKxv8HzpZgMPTzpIeWT";
export const CHECKOUT_SUCCESS_URL = "https://mewmuze.com/checkout/success/";
const testCheckoutUrl = `https://checkout.dodopayments.com/buy/${TEST_DODO_PRODUCT_ID}`;
const configuredCheckoutUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL?.trim() ?? "";

const isDodoCheckout = (url: string) =>
  /^https:\/\/(?:test\.)?checkout\.dodopayments\.com\//i.test(url);

/**
 * Dodo's static product links only return to the merchant when redirect_url is
 * supplied. Keep it on every checkout link, including links supplied through
 * GitHub variables, so a completed purchase always comes back to MewMuze.
 */
const withCheckoutReturn = (checkoutUrl: string): string => {
  if (!isDodoCheckout(checkoutUrl)) return checkoutUrl;
  const url = new URL(checkoutUrl);
  url.searchParams.set("quantity", "1");
  url.searchParams.set("redirect_url", CHECKOUT_SUCCESS_URL);
  return url.toString();
};

// Test mode is intentionally fail-safe: even a stale deployment variable that
// still points at the live product is rejected in favour of this test product.
const normalCheckoutUrl =
  isDodoCheckout(configuredCheckoutUrl) && configuredCheckoutUrl.includes(TEST_DODO_PRODUCT_ID)
    ? withCheckoutReturn(configuredCheckoutUrl)
    : withCheckoutReturn(testCheckoutUrl);

export const commerceMode: CommerceMode = "test";

export const commerce = {
  checkoutUrl: normalCheckoutUrl,
  // The optional supporter product is deliberately disabled in test mode. It
  // previously came from a deployment variable that could contain a live link.
  supporterCheckoutUrl: "",
  configured: /^https:\/\/.+/i.test(normalCheckoutUrl),
  supporterConfigured: false,
} as const;

export function checkoutUrlFor(supportDeveloper: boolean): string {
  if (supportDeveloper && commerce.supporterConfigured) {
    return commerce.supporterCheckoutUrl;
  }
  return commerce.checkoutUrl;
}

/**
 * Whether to advertise the price in rupees.
 *
 * Dodo localises the real amount at checkout either way; this only stops an
 * Indian visitor reading "$7.99" and then being charged in rupees. India is a
 * single timezone, so this is a cheap, offline, no-dependency check.
 *
 * ponytail: timezone heuristic, so a VPN or a travelling buyer reads as the
 * wrong country. Swap for IP geolocation only if that turns out to matter.
 */
export function prefersRupees(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Asia/Calcutta is the legacy alias some browsers still report.
    return zone === "Asia/Kolkata" || zone === "Asia/Calcutta";
  } catch {
    return false;
  }
}

/** Displayed price. Must stay in step with the Dodo product's own pricing. */
export function priceLabelFor(rupees: boolean, supportDeveloper: boolean): string {
  if (rupees) return supportDeveloper ? "₹649" : "₹549";
  return supportDeveloper ? "$8.99" : "$7.99";
}
