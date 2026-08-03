import type { Metadata } from "next";
import "./store.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mewmuze.com";

export const metadata: Metadata = {
  title: "MewMuze Store — Coming Soon",
  description:
    "Preview upcoming original costume concepts for MewMuze, your personal desktop cat.",
  alternates: { canonical: `${siteUrl}/store/` },
  openGraph: {
    title: "MewMuze Store — Coming Soon",
    description:
      "Preview upcoming original costume concepts for MewMuze, your personal desktop cat.",
    url: `${siteUrl}/store/`,
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
