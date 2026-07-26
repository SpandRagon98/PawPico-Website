import { notFound } from "next/navigation";
import { CostumeArtwork } from "../../../components/store/CostumeArtwork";
import { ProductActions } from "../../../components/store/ProductActions";
import { StoreHeader } from "../../../components/store/StoreHeader";
import { productBySlug, storeCatalog } from "../../../data/store/catalog";
import { sitePath } from "../../../lib/site-path";

export function generateStaticParams() {
  return storeCatalog.map((product) => ({ slug: product.slug }));
}

export const dynamicParams = false;

export default async function CostumeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  return (
    <main className="store-page detail-page">
      <StoreHeader />
      <section className="detail-hero section-shell">
        <div>
          <a className="detail-back" href={sitePath("/store/")}>← All costumes</a>
          <div className="eyebrow">{product.category} / VERSION {product.version}</div>
          <h1>{product.name}</h1>
          <p>{product.longDescription}</p>
          <div className="detail-price"><small>Dummy Store price</small><b>${product.price.toFixed(2)}</b><span>{product.currency}</span></div>
          <ProductActions product={product} />
        </div>
        <CostumeArtwork product={product} size="hero" label={`${product.name} simulated preview`} />
      </section>
      <section className="detail-views section-shell" aria-label="Costume views">
        {["Front", "Side", "Movement"].map((view) => (
          <article key={view}><span>{view} preview</span><CostumeArtwork product={product} size="detail" /></article>
        ))}
      </section>
      <section className="detail-specs section-shell section-pad" id="package-details">
        <div>
          <div className="eyebrow">PACKAGE DETAILS</div>
          <h2>Visual only.<br /><em>Behaviour intact.</em></h2>
          <p>{product.description}</p>
        </div>
        <dl>
          <div><dt>Creator</dt><dd>{product.creator}</dd></div>
          <div><dt>Compatible bodies</dt><dd>{product.supportedBodies.join(", ")}</dd></div>
          <div><dt>Package size</dt><dd>{product.packageSizeKb} KB</dd></div>
          <div><dt>Minimum app</dt><dd>{product.minimumAppVersion}</dd></div>
          <div><dt>Included</dt><dd>{product.includedElements.join(", ")}</dd></div>
          <div><dt>Release notes</dt><dd>{product.releaseNotes.join(" · ")}</dd></div>
          <div><dt>Privacy</dt><dd>Installs locally. Contains declarative PNG/WebP visual layers only.</dd></div>
          <div><dt>Support</dt><dd><a href="mailto:support@example.invalid">Support placeholder</a> · Refunds require the future production backend.</dd></div>
        </dl>
      </section>
      <footer className="store-footer"><a href={sitePath("/store/")}>Back to Store</a></footer>
    </main>
  );
}
