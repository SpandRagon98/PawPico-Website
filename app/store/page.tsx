import { CostumeShowcase } from "../../components/store/CostumeShowcase";
import { CostumeInstallGuide } from "../../components/store/CostumeInstallGuide";
import { SiteNav } from "../../components/SiteNav";
import { StoreVideoHero } from "../../components/store/StoreVideoHero";
import { sitePath } from "../../lib/site-path";

export default function StorePage() {
  return (
    <main className="store-page" id="top">
      <a className="store-skip" href="#catalog">
        Skip to the costumes
      </a>
      <header className="site-navigation">
        <SiteNav base={sitePath("/")} />
      </header>

      <StoreVideoHero />
      <CostumeShowcase />
      <CostumeInstallGuide />

      <footer className="store-footer">
        <a href={sitePath("/")} aria-label="MewMuze home">
          MewMuze
        </a>
        <span>THE WARDROBE</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
