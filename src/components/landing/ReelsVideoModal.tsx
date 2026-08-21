"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Play,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Check,
  Star,
  ShieldCheck,
  Store,
  Eye,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

export interface ReelStory {
  id: string;
  titleAr: string;
  titleEn: string;
  author: string;
  authorCityAr: string;
  authorCityEn: string;
  authorAvatar: string;
  rating: number;
  orderNumber: string;
  commentAr: string;
  commentEn: string;
  views: string;
  initialLikes: number;
  videoUrl: string;
  posterImage: string;
  durationText: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  productPrice: number;
  productOriginalPrice: number;
  productImage: string;
  storeName: string;
}

interface ReelsVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  reels: ReelStory[];
  language?: "ar" | "en";
}

export default function ReelsVideoModal({
  isOpen,
  onClose,
  initialIndex = 0,
  reels,
  language = "ar",
}: ReelsVideoModalProps) {
  const isAr = language === "ar";
  const { formatPrice, addToCart, products } = useMarketplace();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    reels.forEach((r) => {
      map[r.id] = r.initialLikes;
    });
    return map;
  });
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [durationText, setDurationText] = useState("00:45");
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  if (prevInitialIndex !== initialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
  }

  // Current Reel
  const currentReel = reels[currentIndex] || reels[0];

  // Handle Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setProgress((cur / dur) * 100);

      const curMins = Math.floor(cur / 60);
      const curSecs = Math.floor(cur % 60);
      setCurrentTime(`${String(curMins).padStart(2, "0")}:${String(curSecs).padStart(2, "0")}`);

      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        const durMins = Math.floor(dur / 60);
        const durSecs = Math.floor(dur % 60);
        setDurationText(`${String(durMins).padStart(2, "0")}:${String(durSecs).padStart(2, "0")}`);
      }
    }
  };

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Mute / Unmute Toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Navigate Reels
  const handleNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      setCurrentIndex(0); // loop back to first
      setProgress(0);
      setIsPlaying(true);
    }
  }, [currentIndex, reels.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      setCurrentIndex(reels.length - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [currentIndex, reels.length]);

  // Like Toggle with animation
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentReel) return;
    const isCurrentlyLiked = !!likedReels[currentReel.id];

    setLikedReels((prev) => ({ ...prev, [currentReel.id]: !isCurrentlyLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [currentReel.id]: (prev[currentReel.id] || currentReel.initialLikes) + (isCurrentlyLiked ? -1 : 1),
    }));

    if (!isCurrentlyLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
    }
  };

  // Quick Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentReel) return;
    const prod = products.find((p) => p.id === currentReel.productId);
    if (prod) {
      addToCart(prod, 1);
    } else {
      // Fallback synthetic product addition
      addToCart(
        {
          id: currentReel.productId,
          name: currentReel.productNameAr,
          name_en: currentReel.productNameEn,
          price: currentReel.productPrice,
          original_price: currentReel.productOriginalPrice,
          image_url: currentReel.productImage,
          store_id: "store-official",
          store_name: currentReel.storeName,
          category_id: "cat-1",
          category_slug: "electronics",
          description: currentReel.titleAr,
          description_en: currentReel.titleEn,
          stock: 20,
          status: "active",
          rating: currentReel.rating,
          reviews_count: 45,
          is_featured: true,
          free_shipping: true,
          created_at: new Date().toISOString(),
        },
        1
      );
    }

    setAddedProduct(currentReel.id);
    setTimeout(() => setAddedProduct(null), 2500);
  };

  // Share link
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator
        .share({
          title: isAr ? currentReel.titleAr : currentReel.titleEn,
          text: isAr ? currentReel.commentAr : currentReel.commentEn,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, togglePlay]);

  // Restart video when index changes
  useEffect(() => {
    if (videoRef.current && isOpen) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !currentReel) return null;

  const isLiked = !!likedReels[currentReel.id];
  const currentLikes = likesCountMap[currentReel.id] ?? currentReel.initialLikes;
  const isAdded = addedProduct === currentReel.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-bold shadow-lg">
          <Sparkles size={14} className="text-orange-400" />
          <span>{isAr ? "ريلز تجارب واستعراض العملاء الموثقة" : "Verified Customer Unboxing Reels"}</span>
          <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {reels.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Reels Card Container */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-4xl h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
        
        {/* Left / Center: Video Canvas Stage */}
        <div
          className="relative flex-1 h-[60%] md:h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.posterImage}
            playsInline
            autoPlay
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover md:object-contain"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Floating Big Heart Animation when Liked */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-ping">
              <Heart size={84} className="fill-red-500 text-red-500 drop-shadow-2xl" />
            </div>
          )}

          {/* Play/Pause Overlay Indicator on click */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <div className="w-16 h-16 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs scale-110 transition-transform">
                <Play size={28} className="fill-white ms-1" />
              </div>
            </div>
          )}

          {/* Top Video Overlay Info */}
          <div className="absolute top-4 start-4 end-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[11px] font-bold">
              <Eye size={12} className="text-orange-400" />
              <span>{currentReel.views} {isAr ? "مشاهدة" : "views"}</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="text-[11px] text-white/80 font-mono bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
                {currentTime} / {durationText}
              </span>
              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/15 transition-all shadow-md cursor-pointer"
                title={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : (isAr ? "كتم الصوت" : "Mute")}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>
          </div>

          {/* Right Floating Actions (TikTok/Reels Style) */}
          <div className="absolute end-3 bottom-20 md:bottom-16 flex flex-col items-center gap-3 z-20 pointer-events-auto">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group/btn cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all border ${
                  isLiked
                    ? "bg-red-600 text-white border-red-500 scale-110"
                    : "bg-black/60 hover:bg-black/80 text-white border-white/20 group-hover/btn:scale-105"
                }`}
              >
                <Heart size={20} className={isLiked ? "fill-white text-white" : "text-white"} />
              </div>
              <span className="text-white text-[10px] font-mono font-bold drop-shadow-md">
                {currentLikes}
              </span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group/btn cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 group-hover/btn:scale-105 transition-all shadow-lg">
                <Share2 size={18} />
              </div>
              <span className="text-white text-[10px] font-bold drop-shadow-md">
                {copiedLink ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "مشاركة" : "Share")}
              </span>
            </button>

            {/* Next Reel Indicator Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center border border-orange-400 shadow-xl transition-all hover:scale-105 cursor-pointer mt-2"
              title={isAr ? "الريل التالي" : "Next Reel"}
            >
              <ChevronDown size={22} />
            </button>
          </div>

          {/* Video Bottom Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-20">
            <div
              className="h-full bg-orange-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Right Column: Customer Details, Verified Review & Buy Widget */}
        <div className="w-full md:w-80 lg:w-96 h-[40%] md:h-full bg-slate-900 border-t md:border-t-0 md:border-s border-white/10 flex flex-col justify-between p-4 sm:p-5 overflow-y-auto">
          
          {/* Reviewer Bio & Rating */}
          <div className="space-y-4">
            {/* Top Navigation Controls for Desktop */}
            <div className="hidden md:flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400">
              <span className="font-bold">{isAr ? "استعراض فيديو حقيقي 100%" : "100% Real Video Review"}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Reviewer Header */}
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentReel.authorAvatar}
                alt={currentReel.author}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 shrink-0 shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-white text-sm sm:text-base truncate">
                    {currentReel.author}
                  </h4>
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? currentReel.authorCityAr : currentReel.authorCityEn}
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold mt-1">
                  <span>{isAr ? "طلب موثق:" : "Verified:"} #{currentReel.orderNumber}</span>
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(currentReel.rating) ? "fill-orange-400" : "text-slate-600"}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-white font-mono" dir="ltr">
                {currentReel.rating.toFixed(1)} / 5.0
              </span>
            </div>

            {/* Review Title & Written Testimonial */}
            <div className="space-y-1.5">
              <h5 className="font-black text-white text-xs sm:text-sm leading-snug">
                {isAr ? currentReel.titleAr : currentReel.titleEn}
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
                &ldquo;{isAr ? currentReel.commentAr : currentReel.commentEn}&rdquo;
              </p>
            </div>
          </div>

          {/* Attached Product Box & Instant Buy CTA */}
          <div className="pt-3 border-t border-white/10 space-y-3 mt-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentReel.productImage}
                alt={currentReel.productNameAr}
                className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0 border border-white/10"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80";
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                  <Store size={10} />
                  <span>{currentReel.storeName}</span>
                </span>
                <h6 className="font-bold text-white text-xs truncate">
                  {isAr ? currentReel.productNameAr : currentReel.productNameEn}
                </h6>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm font-black text-orange-400">
                    {formatPrice(currentReel.productPrice)}
                  </span>
                  {currentReel.productOriginalPrice > currentReel.productPrice && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {formatPrice(currentReel.productOriginalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isAdded
                    ? "!bg-emerald-600 !text-white border border-emerald-500 shadow-emerald-600/30"
                    : "!bg-gradient-to-r !from-orange-500 !to-amber-500 hover:!from-orange-600 hover:!to-amber-600 !text-white border border-orange-400/50 shadow-orange-500/30"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={15} className="stroke-[3]" />
                    <span className="!text-white font-black">{isAr ? "في السلة ✓" : "Added ✓"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} className="stroke-[2.5]" />
                    <span className="!text-white font-black">{isAr ? "شراء المنتج" : "Buy Now"}</span>
                  </>
                )}
              </button>

              <Link
                href={`/product/${currentReel.productId}`}
                onClick={onClose}
                className="py-3 px-3 rounded-xl !bg-slate-800 hover:!bg-slate-700 !text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-600/80 hover:border-orange-500/50 text-center shadow-md active:scale-95"
              >
                <span className="!text-white font-bold">{isAr ? "تفاصيل المنتج" : "Details"}</span>
                <ExternalLink size={13} className="text-orange-400" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
