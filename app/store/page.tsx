import { CostumeArtwork } from "../../components/store/CostumeArtwork";
import { StoreHeader } from "../../components/store/StoreHeader";
import { storeCatalog } from "../../data/store/catalog";
import { sitePath } from "../../lib/site-path";

export default function StorePage() {
  return (
    <main className="store-page" id="top">
      <a className="store-skip" href="#catalog">
        Skip to costume concepts
      </a>
      <StoreHeader />

      <section className="store-hero">
        <div className="store-hero-copy">
          <p className="store-eyebrow">
            <span aria-hidden="true" />
            THE MEWMUZE WARDROBE
          </p>
          <h1>The wardrobe is still being stitched.</h1>
          <p>
            New looks are on the way. Future costume packs will let you dress MewMuze
            for heroic days, cosy nights, festive seasons and everything in between.
          </p>
          <div className="store-hero-actions">
            <a className="store-button store-button-primary" href="#catalog">
              See the concept shelf <span aria-hidden="true">↓</span>
            </a>
            <a className="store-button store-button-quiet" href={sitePath("/")}>
              Return to the MewMuze story
            </a>
          </div>
          <div className="store-honesty">
            <strong>Coming Soon</strong>
            <span>No orders or downloads are active. These are original concept studies.</span>
          </div>
        </div>

        <div className="wardrobe-workbench" aria-label="MewMuze costume workbench">
          <span className="workbench-thread" aria-hidden="true" />
          <span className="workbench-swatch swatch-one" aria-hidden="true" />
          <span className="workbench-swatch swatch-two" aria-hidden="true" />
          <span className="workbench-swatch swatch-three" aria-hidden="true" />
          <div className="workbench-cat">
            <CostumeArtwork
              concept={storeCatalog[0]}
              size="hero"
              label="The current flower-band MewMuze cat beside an original Mecha Hero concept study"
            />
          </div>
          <span className="workbench-note">
            <strong>STITCHING BOARD / 01</strong>
            <small>silhouette · palette · pixel fit</small>
          </span>
        </div>
      </section>

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div className="store-section-heading">
          <div>
            <p className="store-eyebrow">
              <span aria-hidden="true" />
              ORIGINAL FUTURE CONCEPTS
            </p>
            <h2 id="catalog-title">
              Ten ideas.
              <br />
              <em>Still on the sewing table.</em>
            </h2>
          </div>
          <p>
            Every concept begins with a readable cat-sized silhouette. Names, shapes
            and themes are original to MewMuze.
          </p>
        </div>

        <div className="concept-catalog">
          {storeCatalog.map((concept, index) => (
            <article key={concept.slug} className="concept-card">
              <CostumeArtwork concept={concept} label={`${concept.name} original costume concept`} />
              <div className="concept-card-copy">
                <div className="concept-card-meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{concept.category}</small>
                  <b>Coming Soon</b>
                </div>
                <h3>{concept.name}</h3>
                <p>{concept.description}</p>
                <div className="concept-progress" aria-label={`${concept.name} concept progress`}>
                  <span className="is-active">
                    <i />
                    Concept
                  </span>
                  <span>
                    <i />
                    Pixel fit
                  </span>
                  <span>
                    <i />
                    Final stitch
                  </span>
                </div>
                <a href={sitePath(`/store/${concept.slug}/`)}>
                  Open concept notes <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="store-process" id="how-it-works" aria-labelledby="process-title">
        <div className="store-section-heading">
          <div>
            <p className="store-eyebrow">
              <span aria-hidden="true" />
              WHAT HAPPENS NEXT
            </p>
            <h2 id="process-title">
              Drawn carefully.
              <br />
              <em>Released only when ready.</em>
            </h2>
          </div>
          <p>The wardrobe remains a preview until the app-side costume system is ready.</p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Readable silhouette</h3>
              <p>Each idea is reduced to shapes that still read clearly at MewMuze scale.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Authentic cat fit</h3>
              <p>The final outfit must preserve the cat&apos;s face, eyes, ears and personality.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>App-ready release</h3>
              <p>Availability will appear only after installation, removal and reinstallation are dependable.</p>
            </div>
          </li>
        </ol>
      </section>

      <footer className="store-footer">
        <a href={sitePath("/")} aria-label="MewMuze home">
          MewMuze
        </a>
        <span>THE WARDROBE · COMING SOON</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
