"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { getProductById } from "@/lib/marketplace";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import type { Product } from "@/types/marketplace";

const copy = {
  ar: {
    price: "ج.م",
    stock: "الكمية المتاحة",
    outOfStock: "غير متوفر حاليًا",
    add: "أضف للسلة",
    notFound: "المنتج غير موجود",
    back: "الرجوع للرئيسية",
  },
  en: {
    price: "EGP",
    stock: "In stock",
    outOfStock: "Out of stock",
    add: "Add to cart",
    notFound: "Product not found",
    back: "Back to home",
  },
} as const;

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const language = useNoormexaLanguage();
  const text = copy[language];
  const [product, setProduct] = useState<Product | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const loading = loadedId !== id;

  useEffect(() => {
    let active = true;
    getProductById(id).then((p) => {
      if (!active) return;
      setProduct(p);
      setLoadedId(id);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !product) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section">
          <div className="noormexa-container noormexa-empty-state">
            <p>{text.notFound}</p>
            <Link href="/" className="noormexa-primary-button">
              {text.back}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container noormexa-product-detail">
          <div className="noormexa-product-detail-image">
            {product?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} />
            ) : (
              <Package size={48} />
            )}
          </div>
          <div className="noormexa-product-detail-info">
            <h1>{product?.name}</h1>
            <strong className="noormexa-product-detail-price">
              {product?.price} {text.price}
            </strong>
            {product?.description && <p>{product.description}</p>}
            <p className="noormexa-product-detail-stock">
              {product && product.stock > 0 ? `${text.stock}: ${product.stock}` : text.outOfStock}
            </p>
            <button type="button" className="noormexa-primary-button" disabled={!product || product.stock <= 0}>
              <ShoppingBag size={17} />
              {text.add}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
