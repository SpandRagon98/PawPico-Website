export type CommerceMode = "test" | "live";

export const LIVE_DODO_PRODUCT_ID = "pdt_0NkWDKYYlGSBLf59iNa4q";
export const CHECKOUT_SUCCESS_URL = "https://mewmuze.com/checkout/success/";
const liveCheckoutUrl = `https://checkout.dodopayments.com/buy/${LIVE_DODO_PRODUCT_ID}`;
const configuredCheckoutUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL?.trim() ?? "";
const supporterCheckoutUrl =
  process.env.NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL?.trim() ?? "";

const isLiveCheckout = (url: string) =>
  /^https:\/\/checkout\.dodopayments\.com\//i.test(url);

/**
 * Dodo's static product links only return to the merchant when redirect_url is
 * supplied. Keep it on every checkout link, including links supplied through
 * GitHub variables, so a completed purchase always comes back to MewMuze.
 */
const withCheckoutReturn = (checkoutUrl: string): string => {
  if (!isLiveCheckout(checkoutUrl)) return checkoutUrl;
  const url = new URL(checkoutUrl);
  url.searchParams.set("quantity", "1");
  url.searchParams.set("redirect_url", CHECKOUT_SUCCESS_URL);
  return url.toString();
};

// The public product ID is safe to ship. Falling back to the canonical live
// link also prevents an old GitHub variable from sending buyers to a sandbox
// product after the production switch.
const normalCheckoutUrl =
  isLiveCheckout(configuredCheckoutUrl) && configuredCheckoutUrl.includes(LIVE_DODO_PRODUCT_ID)
    ? withCheckoutReturn(configuredCheckoutUrl)
    : withCheckoutReturn(liveCheckoutUrl);

const configuredSupporterCheckoutUrl = isLiveCheckout(supporterCheckoutUrl)
  ? withCheckoutReturn(supporterCheckoutUrl)
  : supporterCheckoutUrl;

export const commerceMode: CommerceMode = "live";

export const commerce = {
  checkoutUrl: normalCheckoutUrl,
  supporterCheckoutUrl: configuredSupporterCheckoutUrl,
  configured: /^https:\/\/.+/i.test(normalCheckoutUrl),
  supporterConfigured: isLiveCheckout(configuredSupporterCheckoutUrl),
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
