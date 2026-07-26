"use client";

import { useState } from "react";
import type { StoreProduct } from "../../data/store/catalog";
import { mockCommerce } from "../../lib/store/commerce";
import { sitePath } from "../../lib/site-path";

export function ProductActions({ product }: { product: StoreProduct }) {
  const [message, setMessage] = useState("");
  const mockBuy = async () => {
    const session = await mockCommerce.createCheckoutSession(product.id);
    await mockCommerce.completeCheckout(session.sessionId);
    setMessage(`${product.name} was added to your mock library. No payment was processed.`);
  };
  return (
    <div className="product-actions">
      <button className="metal-button primary" onClick={() => void mockBuy()}>Mock buy · ${product.price.toFixed(2)}</button>
      {product.packagePath && (
        <a className="metal-button primary" href={sitePath(product.packagePath)} download>
          Download &amp; install package
        </a>
      )}
      <a className="store-link-button" href="#package-details">Inspect package details</a>
      {product.packagePath && (
        <p>After downloading, open the signed .mewcostume file and MewMuze will ask you to confirm installation.</p>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
