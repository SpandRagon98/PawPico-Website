import { notFound } from "next/navigation";
import { CostumeArtwork } from "../../../components/store/CostumeArtwork";
import { StoreHeader } from "../../../components/store/StoreHeader";
import { productBySlug, storeCatalog } from "../../../data/store/catalog";
import { sitePath } from "../../../lib/site-path";

export function generateStaticParams() {
  return storeCatalog.map((concept) => ({ slug: concept.slug }));
}

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = productBySlug(slug);
  if (!concept) notFound();

  return (
    <main className="store-page concept-detail-page">
      <StoreHeader />
      <section className="concept-detail-hero">
        <div className="concept-detail-copy">
          <a className="concept-back" href={sitePath("/store/#catalog")}>
            ← All concepts
          </a>
          <p className="store-eyebrow">
            <span aria-hidden="true" />
            {concept.category} / ORIGINAL CONCEPT
          </p>
          <h1>{concept.name}</h1>
          <p>{concept.longDescription}</p>
          <span className="detail-coming">Coming Soon</span>
        </div>
        <CostumeArtwork
          concept={concept}
          size="hero"
          label={`${concept.name} original MewMuze costume concept`}
        />
      </section>

      <section className="concept-notes" aria-labelledby="concept-notes-title">
        <div>
          <p className="store-eyebrow">
            <span aria-hidden="true" />
            DESIGN NOTES
          </p>
          <h2 id="concept-notes-title">
            A direction,
            <br />
            <em>not a finished product.</em>
          </h2>
        </div>
        <ul>
          {concept.conceptNotes.map((note) => (
            <li key={note}>
              <span aria-hidden="true">✓</span>
              {note}
            </li>
          ))}
        </ul>
        <div className="detail-honesty">
          <strong>Preview status</strong>
          <p>
            This page documents an original future idea only. Nothing can be ordered,
            downloaded or installed from this page.
          </p>
        </div>
      </section>

      <footer className="store-footer">
        <a href={sitePath("/")}>MewMuze</a>
        <span>THE WARDROBE · COMING SOON</span>
        <a href={sitePath("/store/")}>Back to Store</a>
      </footer>
    </main>
  );
}
