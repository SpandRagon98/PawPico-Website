import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./globals.css";
import "./carousel-theme.css";
import "./modern.css";
import "./liquid.css";
import "./hero-glass.css";
import "./site-polish.css";
import "./hero-neon.css";
import "./chat-lab.css";
import "./emotion-lab.css";
import "./tools-lab.css";
import "./costume-lab.css";
import "./tasks-lab.css";
import "./care-lab.css";
import "./feature-roll.css";
import "./adapts-lab.css";
import "./story.css";
import "./directory-glass.css";
import "./section-flow.css";
import "./auth.css";
import { AuthProvider } from "../components/AuthProvider";
import { AuthDialog } from "../components/AuthDialog";
// mewmuze.com is the only production and canonical public website. The former
// GitHub Pages mirror is no longer deployed, so it must not be a fallback.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mewmuze.com";
const catIcon = `${siteUrl}/cat/mewmuze-face-logo-192.png`;
const shortcutIcon = `${siteUrl}/cat/mewmuze-face-logo-32.png`;
const appleIcon = `${siteUrl}/cat/mewmuze-face-logo-180.png`;
const socialImage = `${siteUrl}/og-mewmuze.png`;
const title = "MewMuze — Your Personal Desktop Pet";
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
    shortcut: shortcutIcon,
    apple: appleIcon,
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
        alt: "MewMuze, the flower-band pixel pet peeking into a quiet Windows desktop",
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
  themeColor: "#f9fbff",
  colorScheme: "light",
};

// Site-wide identity only. The purchasable SoftwareApplication node lives on the
// homepage instead: this layout wraps the store, which states plainly that
// nothing is for sale yet, and pricing markup must never appear there.
const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "MewMuze",
      url: `${siteUrl}/`,
      logo: catIcon,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "MewMuze",
      url: `${siteUrl}/`,
      description,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
        {/* Accounts wrap every route: the nav and the download buttons on the
            homepage, the store and the checkout pages all read the session. */}
        <AuthProvider>
          {children}
          <AuthDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
