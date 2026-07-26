"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { storeCatalog, storeCategories, type StoreProduct } from "../../data/store/catalog";
import { sitePath } from "../../lib/site-path";
import { CostumeArtwork } from "./CostumeArtwork";
import { mockCommerce, type CheckoutSession } from "../../lib/store/commerce";

export function StoreClient() {
  const [category, setCategory] = useState("Featured");
  const [owned, setOwned] = useState<string[]>([]);
  const [checkout, setCheckout] = useState<StoreProduct | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void mockCommerce.getOwnedCostumes().then(setOwned);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const products = useMemo(
    () => category === "Featured"
      ? storeCatalog.filter((product) => product.featured)
      : storeCatalog.filter((product) => product.category === category),
    [category],
  );

  const beginMockPurchase = async (product: StoreProduct) => {
    setCheckoutSession(await mockCommerce.createCheckoutSession(product.id));
    setCheckout(product);
  };

  const completeMockPurchase = async () => {
    if (!checkout || !checkoutSession) return;
    await mockCommerce.completeCheckout(checkoutSession.sessionId);
    setOwned(await mockCommerce.getOwnedCostumes());
    setNotice(`${checkout.name} is now in your mock library. No payment was processed.`);
    setCheckout(null);
    setCheckoutSession(null);
  };

  const launch = async (product: StoreProduct) => {
    const installation = await mockCommerce.createInstallationToken(product.slug);
    window.location.href = installation.installUrl;
    setNotice(
      `MewMuze was asked to open ${product.name}. If nothing happens, install MewMuze and use the signed package fallback.`,
    );
  };

  return (
    <>
      <section className="store-catalog section-shell section-pad" id="catalog">
        <div className="store-section-head">
          <div>
            <div className="eyebrow">STORE CATALOG / ORIGINAL DESIGNS</div>
            <h2>Pick a new <em>point of view.</em></h2>
          </div>
          <p>Every price below is dummy Store data. Checkout is a local browser demonstration and never charges a card.</p>
        </div>
        <div className="store-filters" role="group" aria-label="Filter costumes">
          {storeCategories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="costume-grid">
          {products.map((product) => {
            const isOwned = owned.includes(product.id);
            return (
              <article className="costume-card" key={product.id}>
                <div className="costume-card-topline">
                  <span>{product.category}</span>
                  <span>{product.availability === "limited" ? "Limited preview" : `v${product.version}`}</span>
                </div>
                <CostumeArtwork product={product} label={`${product.name} simulated costume preview`} />
                <div className="costume-card-copy">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <dl>
                    <div><dt>Bodies</dt><dd>{product.supportedBodies.length}/5</dd></div>
                    <div><dt>Package</dt><dd>{product.packageSizeKb} KB</dd></div>
                  </dl>
                </div>
                <div className="costume-card-price">
                  <span><small>Dummy price</small>${product.price.toFixed(2)}</span>
                  <span>{product.currency}</span>
                </div>
                <div className="costume-card-actions">
                  <Link className="store-link-button" href={`/store/${product.slug}/`}>
                    View details
                  </Link>
                  {isOwned ? (
                    <button className="metal-button compact primary" onClick={() => void launch(product)}>Install</button>
                  ) : (
                    <button
                      className="metal-button compact primary"
                      disabled={product.availability === "coming-soon"}
                      onClick={() => void beginMockPurchase(product)}
                    >
                      Buy mock
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="store-library" id="library">
        <div className="section-shell store-library-inner">
          <div>
            <div className="eyebrow light">LOCAL MOCK LIBRARY</div>
            <h2>Your costumes,<br /><em>ready when you are.</em></h2>
            <p>Ownership here is stored only in this browser for demonstration. A production library requires the secure backend documented with this project.</p>
          </div>
          <div className="library-window">
            <div className="library-window-head"><span>OWNED COSTUMES</span><span>{owned.length.toString().padStart(2, "0")}</span></div>
            {owned.length === 0 ? (
              <div className="library-empty">Complete a mock checkout to add a costume here.</div>
            ) : (
              owned.map((id) => {
                const product = storeCatalog.find((item) => item.id === id);
                if (!product) return null;
                return (
                  <div className="library-row" key={id}>
                    <span className="library-glyph" style={{ background: product.palette[0] }}>{product.glyph}</span>
                    <span><b>{product.name}</b><small>Mock purchase · v{product.version}</small></span>
                    <button onClick={() => void launch(product)}>Install in MewMuze</button>
                    <button
                      onClick={() => void mockCommerce.createInstallationToken(product.slug).then((value) => navigator.clipboard.writeText(value.installUrl))}
                    >
                      Copy link
                    </button>
                    <button disabled title="Signed downloads require the production backend">Download package</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="installation-section section-shell section-pad" id="install">
        <div className="store-section-head">
          <div>
            <div className="eyebrow">LOCAL INSTALLATION / EXPLICIT CONSENT</div>
            <h2>From Store to cat<br /><em>in five careful steps.</em></h2>
          </div>
        </div>
        <ol className="install-steps">
          {[
            ["01", "Purchase costume", "Use this clearly marked mock checkout while the production backend is unconnected."],
            ["02", "Open MewMuze", "The Store sends a short-lived token through the mewmuze:// Windows protocol."],
            ["03", "Confirm installation", "MewMuze shows the costume details and waits for your explicit approval."],
            ["04", "Verify locally", "The app checks entitlement, signature, hashes, archive paths, size, and compatibility."],
            ["05", "Wear or remove", "The costume appears in Appearance Studio and keeps working offline."],
          ].map(([number, title, copy]) => (
            <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
          ))}
        </ol>
        <div className="install-fallback">
          <strong>MewMuze is required to install this costume.</strong>
          <span>If the app does not open, download MewMuze first. Signed package downloads activate when the secure backend is connected.</span>
          <span className="install-fallback-actions">
            <a className="store-link-button" href={sitePath("/store/samples/space-explorer-sample.mewcostume")} download>
              Development sample
            </a>
            <a className="metal-button compact" href={sitePath("/#download")}>Get MewMuze</a>
          </span>
        </div>
      </section>

      {notice && <div className="store-toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>Dismiss</button></div>}

      {checkout && (
        <div className="mock-checkout-backdrop">
          <section className="mock-checkout" role="dialog" aria-modal="true" aria-labelledby="mock-checkout-title">
            <div className="eyebrow">DEVELOPMENT MODE / NO REAL PAYMENT</div>
            <h2 id="mock-checkout-title">Mock checkout</h2>
            <div className="mock-order">
              <CostumeArtwork product={checkout} size="detail" />
              <div><strong>{checkout.name}</strong><span>Dummy total</span><b>${checkout.price.toFixed(2)} USD</b></div>
            </div>
            <p>No card details are requested. Confirming only adds this product to local browser storage.</p>
            <div className="mock-checkout-actions">
              <button className="store-link-button" onClick={() => { setCheckout(null); setCheckoutSession(null); }}>Cancel</button>
              <button className="metal-button primary" onClick={() => void completeMockPurchase()}>Confirm mock purchase</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
