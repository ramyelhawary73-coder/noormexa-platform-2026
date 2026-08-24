// High-fidelity Vector SVG of the official Ribbon 'N' Logo for NOORMEXA
export function getNoormexaRibbonSvg({
  width = 400,
  height = 300,
  isDark = false,
  showText = true,
  textOnly = false,
}: {
  width?: number;
  height?: number;
  isDark?: boolean;
  showText?: boolean;
  textOnly?: boolean;
} = {}) {
  const textColor = isDark ? "#ffffff" : "#007b8b";

  if (textOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" width="${width}" height="${height}" fill="none" shape-rendering="geometricPrecision">
      <text 
        x="200" 
        y="56" 
        text-anchor="middle" 
        fill="${textColor}" 
        font-family="system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', sans-serif" 
        font-size="44" 
        font-weight="900" 
        letter-spacing="9px"
      >NOORMEXA</text>
    </svg>`;
  }

  // Master Ribbon N Emblem SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 420" width="${width}" height="${height}" fill="none" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <defs>
    <!-- Left Ribbon Front Gradient (Deep Teal to Bright Cyan) -->
    <linearGradient id="nmx-front-left-grad" x1="0%" y1="100%" x2="75%" y2="15%">
      <stop offset="0%" stop-color="#006677" />
      <stop offset="25%" stop-color="#007f92" />
      <stop offset="55%" stop-color="#009eb3" />
      <stop offset="80%" stop-color="#00c2d6" />
      <stop offset="100%" stop-color="#40d9ec" />
    </linearGradient>

    <!-- Top Left Crease / Inner Fold Gradient (Darker Shading for 3D depth) -->
    <linearGradient id="nmx-crease-grad" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#004d5a" />
      <stop offset="40%" stop-color="#006c7d" />
      <stop offset="75%" stop-color="#008fa3" />
      <stop offset="100%" stop-color="#00b4c8" />
    </linearGradient>

    <!-- Center Diagonal Bridge Gradient -->
    <linearGradient id="nmx-diag-grad" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#005866" />
      <stop offset="35%" stop-color="#00798a" />
      <stop offset="70%" stop-color="#00a6b8" />
      <stop offset="100%" stop-color="#3dd3e6" />
    </linearGradient>

    <!-- Right Wing Top Glow Gradient -->
    <linearGradient id="nmx-right-wing-grad" x1="0%" y1="90%" x2="100%" y2="10%">
      <stop offset="0%" stop-color="#008fa2" />
      <stop offset="40%" stop-color="#00bcd4" />
      <stop offset="80%" stop-color="#38d4e7" />
      <stop offset="100%" stop-color="#72e4f3" />
    </linearGradient>

    <!-- Bottom Right Wrap Gradient -->
    <linearGradient id="nmx-bottom-wrap-grad" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#007d8f" />
      <stop offset="50%" stop-color="#00b0c4" />
      <stop offset="100%" stop-color="#6ee1f0" />
    </linearGradient>

    <!-- Soft Depth Shadow Filter -->
    <filter id="nmx-depth-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="-2" dy="4" stdDeviation="6" flood-color="#002d35" flood-opacity="${isDark ? "0.45" : "0.22"}" />
    </filter>
  </defs>

  <g id="noormexa-ribbon-mark" transform="translate(10, 10)">
    <!-- 1. Right Upper Wing (Curves behind diagonal into soft rounded peak) -->
    <path 
      d="M 265,150 
         C 278,95 318,48 375,54 
         C 405,58 424,78 418,108 
         C 410,146 366,204 332,246 
         C 316,266 294,280 270,280 
         C 252,280 242,260 252,230 
         C 260,205 264,175 265,150 Z" 
      fill="url(#nmx-right-wing-grad)"
    />

    <!-- 2. Bottom Right Soft Sweep / Underlap -->
    <path 
      d="M 205,225 
         C 248,260 298,295 342,286 
         C 350,284 345,272 328,266 
         C 285,250 242,225 205,225 Z" 
      fill="url(#nmx-bottom-wrap-grad)"
      opacity="0.9"
    />

    <!-- 3. Left Ribbon & Center Diagonal (Front Swirl with 3D Crease) -->
    <path 
      d="M 92,298 
         C 60,298 52,264 75,232 
         C 104,194 135,140 140,88 
         C 142,58 160,56 178,65 
         C 228,92 288,152 280,215 
         C 272,275 212,296 156,236 
         C 142,221 128,240 114,264 
         C 104,281 101,298 92,298 Z" 
      fill="url(#nmx-crease-grad)"
      filter="url(#nmx-depth-filter)"
    />

    <!-- 4. Front Surface Highlight Layer (Left S-Curve to Crease) -->
    <path 
      d="M 92,298 
         C 60,298 52,264 75,232 
         C 104,194 135,140 140,88 
         C 142,58 160,56 178,65 
         C 206,82 236,116 250,156 
         C 226,126 200,102 172,88 
         C 158,81 148,91 144,115 
         C 137,158 108,210 80,248 
         C 68,265 73,288 92,298 Z" 
      fill="url(#nmx-front-left-grad)"
    />

    <!-- 5. Center Diagonal Core Highlight -->
    <path 
      d="M 178,65 
         C 228,92 284,152 278,210 
         C 272,262 225,282 175,238 
         C 165,228 172,215 185,212 
         C 225,202 258,168 252,130 
         C 246,98 212,78 178,65 Z" 
      fill="url(#nmx-diag-grad)"
      opacity="0.85"
    />
  </g>

  ${
    showText
      ? `<!-- Brand Wordmark NOORMEXA -->
  <text 
    x="250" 
    y="390" 
    text-anchor="middle" 
    fill="${textColor}" 
    font-family="system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', sans-serif" 
    font-size="46" 
    font-weight="900" 
    letter-spacing="9px"
  >NOORMEXA</text>`
      : ""
  }
</svg>`;
}
