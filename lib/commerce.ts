export type CommerceMode = "test" | "live";

export const LIVE_DODO_PRODUCT_ID = "pdt_0NkWDKYYlGSBLf59iNa4q";
const liveCheckoutUrl = `https://checkout.dodopayments.com/buy/${LIVE_DODO_PRODUCT_ID}`;
const configuredCheckoutUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL?.trim() ?? "";
const supporterCheckoutUrl =
  process.env.NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL?.trim() ?? "";

const isLiveCheckout = (url: string) =>
  /^https:\/\/checkout\.dodopayments\.com\//i.test(url);

// The public product ID is safe to ship. Falling back to the canonical live
// link also prevents an old GitHub variable from sending buyers to a sandbox
// product after the production switch.
const normalCheckoutUrl =
  isLiveCheckout(configuredCheckoutUrl) && configuredCheckoutUrl.includes(LIVE_DODO_PRODUCT_ID)
    ? configuredCheckoutUrl
    : liveCheckoutUrl;

export const commerceMode: CommerceMode = "live";

export const commerce = {
  checkoutUrl: normalCheckoutUrl,
  supporterCheckoutUrl,
  configured: /^https:\/\/.+/i.test(normalCheckoutUrl),
  supporterConfigured: isLiveCheckout(supporterCheckoutUrl),
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
