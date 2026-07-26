import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://spandragon98.github.io/PawPico-Website";
const catIcon = `${siteUrl}/mewmuze-flower-cat.png`;
const socialImage = `${siteUrl}/og-mewmuze.png`;
const title = "MewMuze — Your Personal Desktop Cat";
const description =
  "Meet MewMuze, a playful Windows desktop companion with focus tools, smart reminders, local utilities, expressive animations and a customizable personality.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: `${siteUrl}/` },
  applicationName: "MewMuze",
  icons: {
    icon: catIcon,
    shortcut: catIcon,
    apple: catIcon,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${siteUrl}/`,
    siteName: "MewMuze",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "MewMuze, the flower-band pixel cat peeking into a quiet Windows desktop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f6f7",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
