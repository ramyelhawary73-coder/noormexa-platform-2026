"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { getCategoryBySlug, getProductsByCategorySlug } from "@/lib/marketplace";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import type { Category, Product } from "@/types/marketplace";
import ProductImage from "@/components/ProductImage";

const copy = {
  ar: {
    empty: "لسه مفيش منتجات فى القسم ده. كن أول بائع يعرض منتجاته هنا!",
    cta: "ابدأ البيع",
    price: "ج.م",
    notFound: "القسم غير موجود",
    back: "الرجوع للرئيسية",
  },
  en: {
    empty: "No products in this category yet. Be the first seller to list here!",
    cta: "Start selling",
    price: "EGP",
    notFound: "Category not found",
    back: "Back to home",
  },
} as const;

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const language = useNoormexaLanguage();
  const text = copy[language];
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const loading = loadedSlug !== slug;

  useEffect(() => {
    let active = true;
    Promise.all([getCategoryBySlug(slug), getProductsByCategorySlug(slug)]).then(([cat, prods]) => {
      if (!active) return;
      setCategory(cat);
      setProducts(prods);
      setLoadedSlug(slug);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!loading && !category) {
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
          <div className="noormexa-section-heading">
            <h1>{category ? (language === "ar" ? category.name_ar : category.name_en) : "..."}</h1>
          </div>

          {products.length === 0 && !loading ? (
            <div className="noormexa-empty-state">
              <Package size={32} />
              <p>{text.empty}</p>
              <Link href="/auth" className="noormexa-primary-button">
                {text.cta}
              </Link>
            </div>
          ) : (
            <div className="noormexa-product-grid">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="noormexa-product-card">
                  <div className="noormexa-product-image relative overflow-hidden">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
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
