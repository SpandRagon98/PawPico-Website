import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CostumeArtwork } from "../../../components/store/CostumeArtwork";
import { StoreHeader } from "../../../components/store/StoreHeader";
import { productBySlug, storeCatalog } from "../../../data/store/catalog";
import { sitePath } from "../../../lib/site-path";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mewmuze.com";

export function generateStaticParams() {
  return storeCatalog.map((concept) => ({ slug: concept.slug }));
}

/**
 * These are pre-release concept studies with no purchasable product behind them,
 * so they are deliberately kept out of search while remaining fully readable for
 * visitors who follow a link from the store.
 *
 * Previously they were excluded only as a side effect of app/store/layout.tsx
 * canonicalising every child route to /store/. That was accidental rather than
 * chosen, and it left the pages self-contradictory. The noindex below is the
 * explicit decision; the self-referencing canonical replaces the inherited one so
 * the two signals no longer disagree. "follow" is kept so the links out of these
 * pages still pass value back to /store/ and the homepage.
 *
 * Revisit per concept once one has genuinely original content worth ranking.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = productBySlug(slug);
  if (!concept) return {};

  const url = `${siteUrl}/store/${concept.slug}/`;

  return {
    title: `${concept.name} — MewMuze Costume Concept`,
    description: concept.description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: {
      title: `${concept.name} — MewMuze Costume Concept`,
      description: concept.description,
      url,
    },
  };
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
