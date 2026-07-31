"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Package, Store as StoreIcon } from "lucide-react";
import { getStoreBySlug, getProductsByStore } from "@/lib/marketplace";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import type { Store, Product } from "@/types/marketplace";

const copy = {
  ar: {
    empty: "المتجر ده لسه معملش منتجات.",
    price: "ج.م",
    notFound: "المتجر غير موجود",
    back: "الرجوع للرئيسية",
  },
  en: {
    empty: "This store has no products yet.",
    price: "EGP",
    notFound: "Store not found",
    back: "Back to home",
  },
} as const;

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const language = useNoormexaLanguage();
  const text = copy[language];
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const loading = loadedSlug !== slug;

  useEffect(() => {
    let active = true;
    getStoreBySlug(slug).then(async (s) => {
      if (!active) return;
      setStore(s);
      if (s) {
        const prods = await getProductsByStore(s.id);
        if (active) setProducts(prods.filter((p) => p.status === "active"));
      }
      setLoadedSlug(slug);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!loading && !store) {
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
        <div className="noormexa-container">
          <div className="noormexa-store-header">
            <span className="noormexa-card-icon">
              <StoreIcon size={26} />
            </span>
            <div>
              <h1>{store?.name}</h1>
              {store?.description && <p>{store.description}</p>}
            </div>
          </div>

          {products.length === 0 && !loading ? (
            <div className="noormexa-empty-state">
              <Package size={32} />
              <p>{text.empty}</p>
            </div>
          ) : (
            <div className="noormexa-product-grid">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="noormexa-product-card">
                  <div className="noormexa-product-image">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <Package size={28} />
                    )}
                  </div>
                  <div className="noormexa-product-info">
                    <span>{product.name}</span>
                    <strong>
                      {product.price} {text.price}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
