import type { Metadata } from "next";
import "./store.css";

export const metadata: Metadata = {
  title: "MewMuze Costume Store — Original local-install cat costumes",
  description: "Browse original MewMuze costumes, preview compatibility, and try the clearly marked mock checkout.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
