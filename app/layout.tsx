import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const title = "PawPico — One tiny cat. An entire inner life.";
  const description = "Meet PawPico: a private Windows desktop cat with 87 animation states, tactile mochi motion, Work mode, music and microphone reactions, reminders, focus tools, and a complete wardrobe.";
  return {
    metadataBase: base,
    title,
    description,
    icons: { icon: "/pawpico-emblem.png", shortcut: "/pawpico-emblem.png", apple: "/pawpico-emblem.png" },
    openGraph: { title, description, type: "website", images: [{ url: new URL("/og.png", base).toString(), width: 1536, height: 1024, alt: "PawPico, an expressive pixel cat for the Windows desktop" }] },
    twitter: { card: "summary_large_image", title, description, images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
