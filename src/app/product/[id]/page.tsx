"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Package, ShoppingBag, Star, User as UserIcon } from "lucide-react";
import { getProductById, getStoreById, getProductReviews, submitReview, summarizeReviews, type Review } from "@/lib/marketplace";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/marketplace";

const copy = {
  ar: {
    price: "ج.م",
    stock: "الكمية المتاحة",
    outOfStock: "غير متوفر حاليًا",
    add: "أضف للسلة",
    added: "أُضيف للسلة",
    notFound: "المنتج غير موجود",
    back: "الرجوع للرئيسية",
    reviewsTitle: "تقييمات العملاء",
    noReviews: "لسه مفيش تقييمات على المنتج ده. كن أول من يقيّم!",
    yourRating: "تقييمك",
    commentPlaceholder: "شاركنا رأيك فى المنتج (اختياري)",
    submit: "إرسال التقييم",
    submitted: "تم إرسال تقييمك، شكرًا لك!",
    loginToReview: "سجّل دخول عشان تقدر تقيّم المنتج.",
    goLogin: "تسجيل الدخول",
    reviewsCount: "تقييم",
    anonymous: "عميل",
  },
  en: {
    price: "EGP",
    stock: "In stock",
    outOfStock: "Out of stock",
    add: "Add to cart",
    added: "Added to cart",
    notFound: "Product not found",
    back: "Back to home",
    reviewsTitle: "Customer reviews",
    noReviews: "No reviews yet for this product. Be the first to review!",
    yourRating: "Your rating",
    commentPlaceholder: "Share your thoughts about the product (optional)",
    submit: "Submit review",
    submitted: "Your review has been submitted, thank you!",
    loginToReview: "Sign in to review this product.",
    goLogin: "Sign in",
    reviewsCount: "reviews",
    anonymous: "Customer",
  },
} as const;

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const language = useNoormexaLanguage();
  const text = copy[language];
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState("");
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const loading = loadedId !== id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    getProductById(id).then(async (p) => {
      if (!active) return;
      setProduct(p);
      if (p) {
        const [store, productReviews] = await Promise.all([getStoreById(p.store_id), getProductReviews(p.id)]);
        if (!active) return;
        setStoreName(store?.name ?? "");
        setReviews(productReviews);
        if (user) {
          const mine = productReviews.find((r) => r.buyer_id === user.id);
          if (mine) setMyRating(mine.rating);
        }
      }
      setLoadedId(id);
    });
    return () => {
      active = false;
    };
  }, [id, user]);

  const summary = summarizeReviews(reviews);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      storeId: product.store_id,
      storeName,
      maxStock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleSubmitReview = async () => {
    if (!user || !product || myRating === 0) return;
    setSubmitting(true);
    const { review } = await submitReview({
      productId: product.id,
      buyerId: user.id,
      rating: myRating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (review) {
      setReviews((prev) => [review, ...prev.filter((r) => r.buyer_id !== user.id)]);
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 2500);
    }
  };

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
            {summary.count > 0 && (
              <div className="noormexa-review-summary">
                <div className="noormexa-star-row" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} fill={n <= Math.round(summary.average) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span>
                  {summary.average} ({summary.count} {text.reviewsCount})
                </span>
              </div>
            )}
            <strong className="noormexa-product-detail-price">
              {product?.price} {text.price}
            </strong>
            {product?.description && <p>{product.description}</p>}
            <p className="noormexa-product-detail-stock">
              {product && product.stock > 0 ? `${text.stock}: ${product.stock}` : text.outOfStock}
            </p>
            <button
              type="button"
              className="noormexa-primary-button"
              disabled={!product || product.stock <= 0}
              onClick={handleAddToCart}
            >
              {justAdded ? <Check size={17} /> : <ShoppingBag size={17} />}
              {justAdded ? text.added : text.add}
            </button>
          </div>
        </div>
      </section>

      <section className="noormexa-section noormexa-section-soft">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.reviewsTitle}</h2>
          </div>

          <div className="noormexa-review-form-card">
            {user ? (
              <>
                <span className="noormexa-field-label">{text.yourRating}</span>
                <div className="noormexa-star-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMyRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={String(n)}
                    >
                      <Star size={22} fill={n <= (hoverRating || myRating) ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="noormexa-review-textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={text.commentPlaceholder}
                />
                <button
                  type="button"
                  className="noormexa-primary-button"
                  disabled={submitting || myRating === 0}
                  onClick={handleSubmitReview}
                >
                  {text.submit}
                </button>
                {justSubmitted && <p className="noormexa-form-message success">{text.submitted}</p>}
              </>
            ) : (
              <>
                <p className="noormexa-muted-text">{text.loginToReview}</p>
                <Link href="/auth" className="noormexa-primary-button">
                  {text.goLogin}
                </Link>
              </>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="noormexa-empty-state">{text.noReviews}</p>
          ) : (
            <div className="noormexa-reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="noormexa-review-card">
                  <div className="noormexa-review-card-header">
                    <span className="noormexa-review-avatar">
                      <UserIcon size={16} />
                    </span>
                    <div>
                      <strong>{review.reviewer_name || text.anonymous}</strong>
                      <div className="noormexa-star-row noormexa-star-row-small" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} fill={n <= review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
