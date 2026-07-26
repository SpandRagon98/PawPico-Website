import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreClient } from "../../components/store/StoreClient";
import { CostumeArtwork } from "../../components/store/CostumeArtwork";
import { storeCatalog } from "../../data/store/catalog";
import { sitePath } from "../../lib/site-path";

export default function StorePage() {
  const heroProduct = storeCatalog[0];
  return (
    <main className="store-page" id="top">
      <StoreHeader />
      <section className="store-hero section-shell">
        <div className="store-hero-copy">
          <div className="eyebrow"><span className="live-dot" /> MEWMUZE COSTUME STORE / MOCK MODE</div>
          <h1>Dress<br /><em>the muse.</em></h1>
          <p>Original costumes made for your MewMuze. Buy once, install locally, and change your cat whenever the mood changes.</p>
          <div className="store-hero-actions">
            <a className="metal-button primary" href="#catalog">Browse costumes</a>
            <a className="text-link" href="#install">How installation works</a>
          </div>
          <div className="mock-banner"><b>Mock storefront</b><span>Dummy $1–$2 prices · no cards · no payment processing</span></div>
        </div>
        <div className="store-hero-preview">
          <div className="store-preview-title"><span>LIVE COSTUME SIMULATION</span><span className="window-dots"><i /><i /><i /></span></div>
          <CostumeArtwork product={heroProduct} size="hero" label={`${heroProduct.name} on MewMuze`} />
          <div className="store-preview-readout">
            <span><small>LOOK</small>{heroProduct.name}</span>
            <span><small>FIT</small>5 body types</span>
            <span><small>INSTALL</small>Local + signed</span>
          </div>
        </div>
      </section>
      <div className="store-ticker" aria-label="Costume Store qualities">
        <div>{["ORIGINAL ART", "SIGNED PACKAGES", "LOCAL INSTALL", "OFFLINE WEAR", "NO EXECUTABLE CODE", "USER CONTROL"].map((item) => <span key={item}>{item}<i>◆</i></span>)}</div>
      </div>
      <StoreClient />
      <footer className="store-footer">
        <span>MewMuze Costume Store · Mock commerce mode</span>
        <a href={sitePath("/")}>Return to MewMuze</a>
      </footer>
    </main>
  );
}
