"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

export default function ProductImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  className = "object-cover group-hover:scale-105 transition-transform duration-300",
  containerClassName = "w-full h-full relative",
  fallbackSrc = DEFAULT_FALLBACK,
  priority = false,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source was provided at all
  if (!src && !fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-surface-soft text-muted ${containerClassName}`}>
        <Package size={28} />
      </div>
    );
  }

  const effectiveSrc = hasError ? fallbackSrc : imgSrc;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Subtle skeleton shimmer before lazy loaded image arrives */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/60 dark:bg-slate-800/60 animate-pulse pointer-events-none z-0" />
      )}

      {fill ? (
        <Image
          src={effectiveSrc}
          alt={alt || "Product image"}
          fill
          sizes={sizes}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          referrerPolicy="no-referrer"
          className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError && effectiveSrc !== fallbackSrc) {
              setHasError(true);
              setImgSrc(fallbackSrc);
            }
          }}
        />
      ) : (
        <Image
          src={effectiveSrc}
          alt={alt || "Product image"}
          width={width || 300}
          height={height || 300}
          sizes={sizes}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          referrerPolicy="no-referrer"
          className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError && effectiveSrc !== fallbackSrc) {
              setHasError(true);
              setImgSrc(fallbackSrc);
            }
          }}
        />
      )}
    </div>
  );
}
