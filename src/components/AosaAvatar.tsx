import React from "react";

interface AosaAvatarProps {
  size?: number;
  className?: string;
  showOnlineBadge?: boolean;
}

export default function AosaAvatar({
  size = 40,
  className = "",
  showOnlineBadge = true,
}: AosaAvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-full overflow-hidden shadow-sm"
      >
        <defs>
          <linearGradient id="aosaBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="aosaHair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B1C10" />
            <stop offset="100%" stopColor="#1C0D07" />
          </linearGradient>
          <linearGradient id="aosaSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDDFC7" />
            <stop offset="100%" stopColor="#F5CBA7" />
          </linearGradient>
          <linearGradient id="aosaSuit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1C2541" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="50" fill="url(#aosaBg)" />

        {/* Outer subtle glow rim */}
        <circle cx="50" cy="50" r="48.5" stroke="#FBBF24" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Clothing / Shoulders */}
        <path
          d="M20 98 C22 76 34 70 50 70 C66 70 78 76 80 98 Z"
          fill="url(#aosaSuit)"
        />
        {/* Collar Accent (Gold trim) */}
        <path
          d="M38 72 L50 84 L62 72 Z"
          fill="#F59E0B"
        />
        <path
          d="M44 72 L50 80 L56 72 Z"
          fill="#FEF3C7"
        />

        {/* Neck */}
        <rect x="44" y="58" width="12" height="15" rx="4" fill="url(#aosaSkin)" />

        {/* Back Hair */}
        <path
          d="M26 40 C22 55 24 72 32 75 C36 65 38 52 38 45 Z"
          fill="url(#aosaHair)"
        />
        <path
          d="M74 40 C78 55 76 72 68 75 C64 65 62 52 62 45 Z"
          fill="url(#aosaHair)"
        />

        {/* Face */}
        <ellipse cx="50" cy="46" rx="20" ry="21" fill="url(#aosaSkin)" />

        {/* Cute blush on cheeks */}
        <circle cx="36" cy="50" r="4" fill="#F43F5E" fillOpacity="0.25" />
        <circle cx="64" cy="50" r="4" fill="#F43F5E" fillOpacity="0.25" />

        {/* Cheerful expressive eyes */}
        {/* Left eye */}
        <ellipse cx="40" cy="44" rx="3.2" ry="4" fill="#1E293B" />
        <circle cx="41.2" cy="42.5" r="1.3" fill="#FFFFFF" />
        <circle cx="39" cy="45" r="0.6" fill="#FFFFFF" />
        {/* Left eyebrow */}
        <path d="M36 38 C38 36.5 43 37 44 38.5" stroke="#2D150B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Right eye */}
        <ellipse cx="60" cy="44" rx="3.2" ry="4" fill="#1E293B" />
        <circle cx="61.2" cy="42.5" r="1.3" fill="#FFFFFF" />
        <circle cx="59" cy="45" r="0.6" fill="#FFFFFF" />
        {/* Right eyebrow */}
        <path d="M56 38.5 C57 37 62 36.5 64 38" stroke="#2D150B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Small cute nose */}
        <path d="M49.5 47 Q50 49 51.5 48.8" stroke="#D97706" strokeWidth="0.9" strokeLinecap="round" fill="none" />

        {/* Friendly gentle smile */}
        <path
          d="M44 53 Q50 58.5 56 53"
          stroke="#BE123C"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Modern stylish Bob bangs Hair */}
        <path
          d="M28 40 C28 24 38 18 50 18 C62 18 72 24 72 40 C68 34 60 30 50 31 C40 30 32 34 28 40 Z"
          fill="url(#aosaHair)"
        />
        {/* Hair strand details */}
        <path
          d="M34 28 C42 22 55 24 64 30"
          stroke="#78350F"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 36 C33 42 36 46 36 50 C33 47 31 43 30 36 Z"
          fill="url(#aosaHair)"
        />
        <path
          d="M70 36 C67 42 64 46 64 50 C67 47 69 43 70 36 Z"
          fill="url(#aosaHair)"
        />

        {/* High-tech Headset (Smart AI Assistant Gear) */}
        <path
          d="M24 43 C23 30 34 19 50 19 C66 19 77 30 76 43"
          stroke="#E2E8F0"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Headset earpiece left */}
        <rect x="22" y="38" width="5" height="11" rx="2.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1" />
        {/* Headset earpiece right */}
        <rect x="73" y="38" width="5" height="11" rx="2.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1" />
        {/* Microphone boom */}
        <path
          d="M25 46 Q28 58 39 58"
          stroke="#CBD5E1"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Glowing microphone tip (Golden/Emerald pulse) */}
        <circle cx="40" cy="58" r="2.5" fill="#10B981" />
        <circle cx="40" cy="58" r="1.2" fill="#FFFFFF" />

        {/* Little decorative star sparkle in hair */}
        <path
          d="M66 26 L67 29 L70 30 L67 31 L66 34 L65 31 L62 30 L65 29 Z"
          fill="#FDE047"
        />
      </svg>

      {/* Online indicator badge */}
      {showOnlineBadge && (
        <span
          className="absolute bottom-0 end-0 block rounded-full ring-2 ring-surface bg-emerald-500"
          style={{
            width: Math.max(8, Math.round(size * 0.22)),
            height: Math.max(8, Math.round(size * 0.22)),
          }}
          title="AOSA متصلة وجاهزة"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        </span>
      )}
    </div>
  );
}
