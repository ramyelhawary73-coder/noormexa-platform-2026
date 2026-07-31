"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Language = "ar" | "en";

type Slide = {
  image: string;
  arTitle: string;
  arText: string;
  enTitle: string;
  enText: string;
};

const slides: Slide[] = [
  {
    image: "/images/landing/hero-slide-products.webp",
    arTitle: "منتجات قريبة وواضحة",
    arText: "اكتشف المنتجات والمتاجر والعروض في مساحة واحدة.",
    enTitle: "Clear product discovery",
    enText: "Discover products, stores, and offers in one place.",
  },
  {
    image: "/images/landing/hero-slide-shopping.webp",
    arTitle: "تسوق بسهولة",
    arText: "واجهة سريعة تساعد العميل على الوصول لما يبحث عنه.",
    enTitle: "Shop easily",
    enText: "A simple interface that helps shoppers find what they need.",
  },
  {
    image: "/images/landing/hero-slide-stores.webp",
    arTitle: "متاجر وعلامات تجارية",
    arText: "اعرض متجرك ومنتجاتك بشكل منظم داخل السوق.",
    enTitle: "Stores and brands",
    enText: "Present your store and products clearly inside the market.",
  },
  {
    image: "/images/landing/hero-slide-ads.webp",
    arTitle: "إعلانات وعروض",
    arText: "اجعل عروضك ظاهرة في مكان مناسب داخل تجربة التسوق.",
    enTitle: "Ads and offers",
    enText: "Place offers where shoppers can see them clearly.",
  },
  {
    image: "/images/landing/hero-slide-logistics.webp",
    arTitle: "تجربة سوق منظمة",
    arText: "عرض واضح يساعد العميل على الانتقال بين الشراء والبيع.",
    enTitle: "Organized market flow",
    enText: "A clear view that connects shopping and selling actions.",
  },
];

type HeroImageSliderProps = {
  language?: Language;
};

export default function HeroImageSlider({ language = "ar" }: HeroImageSliderProps = {}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const isArabic = language === "ar";

  useEffect(() => {
    if (paused) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4300);

    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[index];
  const title = isArabic ? slide.arTitle : slide.enTitle;
  const text = isArabic ? slide.arText : slide.enText;

  const controls = useMemo(() => {
    const previous = () => setIndex((current) => (current - 1 + slides.length) % slides.length);
    const next = () => setIndex((current) => (current + 1) % slides.length);
    return { previous, next };
  }, []);

  return (
    <section
      className="noormexa-slider-card"
      aria-label={isArabic ? "معاينة صور سوق NOORMEXA" : "NOORMEXA market image preview"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="noormexa-slider-frame">
        <Image
          key={slide.image}
          src={slide.image}
          alt={title}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 48vw, 560px"
          className="noormexa-slider-image"
          priority={index === 0}
        />
      </div>

      <div className="noormexa-slider-content">
        <div className="noormexa-slider-copy">
          <strong>{title}</strong>
          <span>{text}</span>
        </div>

        <div className="noormexa-slider-tools">
          <button
            type="button"
            className="noormexa-slider-arrow"
            onClick={isArabic ? controls.next : controls.previous}
            aria-label={isArabic ? "الصورة السابقة" : "Previous image"}
          >
            {isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <div className="noormexa-slider-dots" aria-label={isArabic ? "اختيار الصورة" : "Choose image"}>
            {slides.map((item, dotIndex) => (
              <button
                type="button"
                key={item.image}
                className={dotIndex === index ? "noormexa-slider-dot active" : "noormexa-slider-dot"}
                onClick={() => setIndex(dotIndex)}
                aria-label={`${isArabic ? "الصورة" : "Image"} ${dotIndex + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="noormexa-slider-arrow"
            onClick={isArabic ? controls.previous : controls.next}
            aria-label={isArabic ? "الصورة التالية" : "Next image"}
          >
            {isArabic ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}
