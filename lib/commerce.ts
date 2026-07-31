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
