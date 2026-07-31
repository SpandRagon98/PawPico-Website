export type CommerceMode = "test" | "live";

const normalCheckoutUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL?.trim() ?? "";
const supporterCheckoutUrl =
  process.env.NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL?.trim() ?? "";

export const commerceMode: CommerceMode =
  process.env.NEXT_PUBLIC_DODO_MODE === "live" ? "live" : "test";

export const commerce = {
  checkoutUrl: normalCheckoutUrl,
  supporterCheckoutUrl,
  configured: /^https:\/\/.+/i.test(normalCheckoutUrl),
  supporterConfigured: /^https:\/\/.+/i.test(supporterCheckoutUrl),
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
 * Indian visitor reading "$5.99" and then being charged in rupees. India is a
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
  if (rupees) return supportDeveloper ? "₹599" : "₹499";
  return supportDeveloper ? "$6.99" : "$5.99";
}
