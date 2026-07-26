"use client";

import { useState } from "react";
import type { StoreProduct } from "../../data/store/catalog";
import { mockCommerce } from "../../lib/store/commerce";

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
      <a className="store-link-button" href="#package-details">Inspect package details</a>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
