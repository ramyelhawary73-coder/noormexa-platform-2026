/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// High-Definition Master Vector SVG for NOORMEXA - Letter 'N' with Radiant Ray of Light (شعاع النور)
function getSvg(isDark = true) {
  const bgFill = isDark ? '#090d16' : '#ffffff';
  const rimStroke = isDark ? '#f97316' : '#ea580c';
  const rimOpacity = isDark ? '0.7' : '0.85';
  const innerRimOpacity = isDark ? '0.2' : '0.12';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${isDark ? '#141d2e' : '#ffffff'}" />
      <stop offset="50%" stop-color="${isDark ? '#090d16' : '#f8fafc'}" />
      <stop offset="100%" stop-color="${isDark ? '#04070e' : '#f1f5f9'}" />
    </linearGradient>

    <!-- Squircle Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="${rimOpacity}" />
      <stop offset="35%" stop-color="#f97316" stop-opacity="${rimOpacity}" />
      <stop offset="70%" stop-color="#ea580c" stop-opacity="${rimOpacity}" />
      <stop offset="100%" stop-color="${isDark ? '#1e293b' : '#cbd5e1'}" stop-opacity="0.5" />
    </linearGradient>

    <!-- N Letter Gold-Sunset Gradient -->
    <linearGradient id="nGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="25%" stop-color="#f97316" />
      <stop offset="60%" stop-color="#fb923c" />
      <stop offset="85%" stop-color="#fcd34d" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>

    <!-- Ray of Light (شعاع النور) Main Laser Beam -->
    <linearGradient id="rayBeam" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="20%" stop-color="#fef08a" stop-opacity="0.85" />
      <stop offset="50%" stop-color="#fb923c" stop-opacity="0.6" />
      <stop offset="80%" stop-color="#f97316" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
    </linearGradient>

    <!-- Secondary Ambient Rays -->
    <linearGradient id="ambientRay1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#fbbf24" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#f97316" stop-opacity="0" />
    </linearGradient>

    <linearGradient id="ambientRay2" x1="0%" y1="100%" x2="60%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#fb923c" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
    </linearGradient>

    <!-- Light Flare Center -->
    <radialGradient id="starFlare" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="25%" stop-color="#fef08a" stop-opacity="0.9" />
      <stop offset="55%" stop-color="#f97316" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#f97316" stop-opacity="0" />
    </radialGradient>

    <!-- Ambient Glow Behind N -->
    <radialGradient id="glowBack" cx="65%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="${isDark ? '0.35' : '0.2'}" />
      <stop offset="50%" stop-color="#ea580c" stop-opacity="${isDark ? '0.15' : '0.08'}" />
      <stop offset="100%" stop-color="#f97316" stop-opacity="0" />
    </radialGradient>

    <!-- 3D Bevel Lighting -->
    <linearGradient id="bevelLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- 1. Squircle Luxury Base Canvas -->
  <rect x="16" y="16" width="480" height="480" rx="116" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="8" />
  
  <!-- 2. Inner Refined Chamfer Rim -->
  <rect x="30" y="30" width="452" height="452" rx="102" fill="none" stroke="url(#borderGrad)" stroke-width="2" stroke-opacity="${innerRimOpacity}" />

  <!-- 3. Ambient Radiant Glow -->
  <circle cx="340" cy="170" r="180" fill="url(#glowBack)" />

  <!-- 4. Dynamic Ray of Light Beams (أشعة النور المنطلقة من حرف N) -->
  <!-- Wide Radiant Cone Beam -->
  <polygon points="330,175 480,30 430,20 290,160" fill="url(#rayBeam)" opacity="0.85" />
  
  <!-- Secondary Sharp Ray 1 (Shooting Up-Right) -->
  <polygon points="345,160 488,68 472,50 320,150" fill="url(#ambientRay1)" opacity="0.9" />

  <!-- Secondary Sharp Ray 2 (Shooting High-Vertical) -->
  <polygon points="335,165 395,20 375,20 310,155" fill="url(#ambientRay2)" opacity="0.75" />

  <!-- Secondary Diagonal Laser Ray 3 (Shooting Far Right) -->
  <polygon points="340,180 490,140 485,120 330,170" fill="url(#ambientRay2)" opacity="0.6" />

  <!-- 5. Iconic Sculptural Monogram Letter 'N' -->
  <!-- Left Vertical Pillar of N -->
  <path d="M 112 140 C 112 122, 126 108, 144 108 L 152 108 C 170 108, 184 122, 184 140 L 184 372 C 184 390, 170 404, 152 404 L 144 404 C 126 404, 112 390, 112 372 Z" fill="url(#nGrad)" />
  <!-- Left Pillar Bevel Light Accent -->
  <path d="M 116 142 C 116 126, 128 114, 144 114 L 152 114 C 160 114, 168 118, 174 125 L 174 380 C 170 388, 160 394, 150 394 L 144 394 C 130 394, 118 384, 116 370 Z" fill="url(#bevelLight)" opacity="0.25" />

  <!-- Powerful Diagonal Bridge of N -->
  <polygon points="120,118 184,118 392,386 328,386" fill="url(#nGrad)" />
  <!-- Diagonal Bridge Top Light Edge -->
  <polygon points="135,118 184,118 340,315 320,315" fill="url(#bevelLight)" opacity="0.35" />

  <!-- Right Vertical Pillar of N (Seamlessly Launches the Ray of Light) -->
  <path d="M 328 140 C 328 122, 342 108, 360 108 L 368 108 C 386 108, 400 122, 400 140 L 400 372 C 400 390, 386 404, 368 404 L 360 404 C 342 404, 328 390, 328 372 Z" fill="url(#nGrad)" />
  
  <!-- 6. Brilliant Diamond Starburst Flare (بؤرة النور المتوهجة على قمة النون) -->
  <!-- Outer Glow Circle -->
  <circle cx="364" cy="130" r="54" fill="url(#starFlare)" />

  <!-- 4-Point Majestic Light Diamond Flare -->
  <!-- Horizontal Light Flare Spike -->
  <polygon points="364,106 374,130 364,154 354,130" fill="#ffffff" opacity="0.95" />
  <polygon points="364,70 370,130 364,190 358,130" fill="#ffffff" opacity="0.95" />
  
  <!-- Diagonal Light Flare Spike -->
  <polygon points="320,130 364,124 408,130 364,136" fill="#ffffff" opacity="0.95" />
  <polygon points="340,106 368,126 388,154 360,134" fill="#fef08a" opacity="0.8" />
  <polygon points="340,154 360,126 388,106 368,134" fill="#fef08a" opacity="0.8" />

  <!-- Diamond Center Intense Core -->
  <circle cx="364" cy="130" r="8" fill="#ffffff" />
  <circle cx="364" cy="130" r="16" fill="#fef08a" opacity="0.75" />
</svg>`;
}

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const brandDir = path.join(publicDir, 'brand');

  if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });

  const darkSvg = getSvg(true);
  const lightSvg = getSvg(false);

  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), darkSvg);
  fs.writeFileSync(path.join(publicDir, 'brand', 'emblem-dark.svg'), darkSvg);
  fs.writeFileSync(path.join(publicDir, 'brand', 'emblem-light.svg'), lightSvg);

  const svgBuffer = Buffer.from(darkSvg);

  // Generate PNGs at multiple resolutions
  console.log('Generating 512x512 icon...');
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(brandDir, 'app-icon-dark.png'));

  console.log('Generating 192x192 icon...');
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Generating 180x180 Apple Touch icon...');
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Generating 96x96 and 32x32 Favicons...');
  await sharp(svgBuffer).resize(96, 96).png().toFile(path.join(publicDir, 'favicon.png'));
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(appDir, 'favicon.ico'));

  console.log('Assets successfully generated!');
}

run().catch(console.error);
