import type { Metadata } from "next";
import "./store.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mewmuze.com";

const DESCRIPTION =
  "The costumes that come with MewMuze Pro: Corporate Cat, Cyberpunk Cat and Bat Cat, each drawn live on your desktop pet.";

export const metadata: Metadata = {
  title: "MewMuze Store — The Wardrobe",
  description: DESCRIPTION,
  alternates: { canonical: `${siteUrl}/store/` },
  openGraph: {
    title: "MewMuze Store — The Wardrobe",
    description: DESCRIPTION,
    url: `${siteUrl}/store/`,
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
