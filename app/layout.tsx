import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "MewMuze — One tiny cat. An entire inner life.";
const description = "Meet MewMuze: an expressive Windows desktop cat with Work mode, opt-in Gmail and Calendar connectors, smart reminders, 87 animation states, tactile mochi motion, focus tools, and a complete wardrobe.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: `${publicBasePath}/pawpico-face-logo.png`,
    shortcut: `${publicBasePath}/pawpico-face-logo.png`,
    apple: `${publicBasePath}/pawpico-face-logo.png`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{
      url: `${publicBasePath}/og-v2.png`,
      width: 1536,
      height: 1024,
      alt: "MewMuze, an expressive pixel cat for the Windows desktop",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${publicBasePath}/og-v2.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
