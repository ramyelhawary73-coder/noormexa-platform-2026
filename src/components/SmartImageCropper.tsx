"use client";

import { useState, useRef, useCallback } from "react";
import {
  Crop,
  Sparkles,
  Upload,
  RotateCw,
  ZoomIn,
  Sliders,
  Check,
  X,
  Layers,
  Sun,
  Contrast,
  Palette,
  ShieldCheck,
  Tag,
  Maximize2,
  RefreshCw,
  Move,
} from "lucide-react";

export type AspectRatioType = "1:1" | "16:9" | "12:5" | "4:5" | "9:16" | "free";
export type OverlayBadgeType = "none" | "verified" | "gold_border" | "discount" | "express";

interface SmartImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  initialImageUrl?: string;
  defaultAspectRatio?: AspectRatioType;
  title?: string;
  isAr?: boolean;
}

export default function SmartImageCropper({
  isOpen,
  onClose,
  onCropComplete,
  initialImageUrl = "",
  defaultAspectRatio = "16:9",
  title,
  isAr = true,
}: SmartImageCropperProps) {
  if (!isOpen) return null;

  return (
    <SmartImageCropperModal
      key={initialImageUrl || "cropper-modal"}
      onClose={onClose}
      onCropComplete={onCropComplete}
      initialImageUrl={initialImageUrl}
      defaultAspectRatio={defaultAspectRatio}
      title={title}
      isAr={isAr}
    />
  );
}

function SmartImageCropperModal({
  onClose,
  onCropComplete,
  initialImageUrl = "",
  defaultAspectRatio = "16:9",
  title,
  isAr = true,
}: Omit<SmartImageCropperProps, "isOpen">) {
  // Image state
  const [imageSrc, setImageSrc] = useState<string>(initialImageUrl);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(defaultAspectRatio);

  // Transform state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filters & Enhancement
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Overlay / Merge Badge
  const [overlayBadge, setOverlayBadge] = useState<OverlayBadgeType>("none");
  const [discountBadgeText, setDiscountBadgeText] = useState("خصم 20%");

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "overlay">("crop");

  // DOM Refs
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setOverlayBadge("none");
  }, []);

  // Smart Auto-Crop algorithm: Centers and maximizes crop area without empty margins
  const handleSmartAutoCrop = useCallback(() => {
    if (!imgRef.current) return;
    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    let targetRatio = 1;
    if (aspectRatio === "16:9") targetRatio = 16 / 9;
    else if (aspectRatio === "12:5") targetRatio = 12 / 5;
    else if (aspectRatio === "4:5") targetRatio = 4 / 5;
    else if (aspectRatio === "9:16") targetRatio = 9 / 16;
    else if (aspectRatio === "1:1") targetRatio = 1;
    else targetRatio = naturalWidth / naturalHeight;

    const currentImgRatio = naturalWidth / naturalHeight;

    // Calculate smart zoom so the image fills the crop window perfectly with zero letterboxing
    if (currentImgRatio > targetRatio) {
      // Image is wider than target crop
      const calculatedZoom = currentImgRatio / targetRatio;
      setZoom(Math.max(1, Math.min(3, calculatedZoom)));
    } else {
      // Image is taller than target crop
      const calculatedZoom = targetRatio / currentImgRatio;
      setZoom(Math.max(1, Math.min(3, calculatedZoom)));
    }

    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, [aspectRatio]);

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          resetTransform();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Apply Enhancements & Crop to Output High-Resolution Canvas
  const generateCroppedImage = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define target export resolution
    let targetWidth = 1200;
    let targetHeight = 675; // 16:9

    if (aspectRatio === "1:1") {
      targetWidth = 1000;
      targetHeight = 1000;
    } else if (aspectRatio === "12:5") {
      targetWidth = 1200;
      targetHeight = 500;
    } else if (aspectRatio === "4:5") {
      targetWidth = 960;
      targetHeight = 1200;
    } else if (aspectRatio === "9:16") {
      targetWidth = 720;
      targetHeight = 1280;
    } else if (aspectRatio === "free") {
      targetWidth = img.naturalWidth || 1000;
      targetHeight = img.naturalHeight || 1000;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Background fill
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Apply color filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Save context before transformation
    ctx.save();

    // Center and transform
    ctx.translate(targetWidth / 2 + pan.x * (targetWidth / 400), targetHeight / 2 + pan.y * (targetHeight / 400));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate draw dimensions preserving aspect ratio
    const drawWidth = targetWidth;
    const drawHeight = (img.naturalHeight / img.naturalWidth) * targetWidth;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Restore context
    ctx.restore();

    // Reset filter for overlays
    ctx.filter = "none";

    // Draw Overlays / Badges
    if (overlayBadge === "gold_border") {
      // Luxury Gold Frame
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, targetWidth - 14, targetHeight - 14);

      // Gold Corner Accents
      ctx.fillStyle = "#d4af37";
      const cornerSize = 48;
      ctx.fillRect(0, 0, cornerSize, 14);
      ctx.fillRect(0, 0, 14, cornerSize);
      ctx.fillRect(targetWidth - cornerSize, 0, cornerSize, 14);
      ctx.fillRect(targetWidth - 14, 0, 14, cornerSize);
      ctx.fillRect(0, targetHeight - 14, cornerSize, 14);
      ctx.fillRect(0, targetHeight - cornerSize, 14, cornerSize);
      ctx.fillRect(targetWidth - cornerSize, targetHeight - 14, cornerSize, 14);
      ctx.fillRect(targetWidth - 14, targetHeight - cornerSize, 14, cornerSize);
    } else if (overlayBadge === "verified") {
      // Verified Platform Seal
      const badgeWidth = Math.min(targetWidth * 0.28, 260);
      const badgeHeight = 56;
      const x = targetWidth - badgeWidth - 24;
      const y = 24;

      ctx.fillStyle = "rgba(11, 19, 34, 0.88)";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, badgeWidth, badgeHeight, 16);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, badgeWidth, badgeHeight);
      }

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✔ موثق NOORMEXA", x + badgeWidth / 2, y + 36);
    } else if (overlayBadge === "discount") {
      // Discount Banner Ribbon
      const ribbonWidth = Math.min(targetWidth * 0.3, 240);
      const ribbonHeight = 60;
      const x = 24;
      const y = 24;

      ctx.fillStyle = "#dc2626";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, ribbonWidth, ribbonHeight, 16);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, ribbonWidth, ribbonHeight);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "black 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(discountBadgeText || "خصم حصري", x + ribbonWidth / 2, y + 38);
    } else if (overlayBadge === "express") {
      // Express Delivery Badge
      const badgeWidth = Math.min(targetWidth * 0.32, 280);
      const badgeHeight = 56;
      const x = 24;
      const y = targetHeight - badgeHeight - 24;

      ctx.fillStyle = "#d97706";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, badgeWidth, badgeHeight, 16);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, badgeWidth, badgeHeight);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 19px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚡ شحن فوري NOORMEXA", x + badgeWidth / 2, y + 36);
    }

    // Convert to web-friendly optimized DataURL
    const finalDataUrl = canvas.toDataURL("image/webp", 0.92);
    onCropComplete(finalDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-surface border border-line rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-surface-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-foreground">
                {title || (isAr ? "استوديو القص والمعالجة الذكي للصور" : "Smart Image Studio & Cropper")}
              </h3>
              <p className="text-[11px] text-muted">
                {isAr
                  ? "قص تلقائي دقيق وضبط الأبعاد وإضافة الشارات والفلاتر للمنشورات والمنتجات"
                  : "Auto-fit, aspect ratio crop, filters & luxury overlays"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-surface border border-line hover:border-gold text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Upload size={14} className="text-gold" />
              <span className="hidden sm:inline">{isAr ? "رفع صورة بديلة" : "Upload New"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface-soft border border-line flex items-center justify-center text-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Studio Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Visual Stage (Canvas / Preview) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-black/90 flex flex-col items-center justify-center relative select-none min-h-[300px] sm:min-h-[420px]">
            {imageSrc ? (
              <div
                ref={containerRef}
                className="relative overflow-hidden border-2 border-dashed border-gold/70 shadow-2xl rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing max-w-full max-h-[380px]"
                style={{
                  aspectRatio:
                    aspectRatio === "16:9"
                      ? "16 / 9"
                      : aspectRatio === "12:5"
                      ? "12 / 5"
                      : aspectRatio === "1:1"
                      ? "1 / 1"
                      : aspectRatio === "4:5"
                      ? "4 / 5"
                      : aspectRatio === "9:16"
                      ? "9 / 16"
                      : "auto",
                  width: aspectRatio === "9:16" ? "220px" : aspectRatio === "4:5" ? "260px" : "100%",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Edit Target"
                  className="max-w-none transition-transform pointer-events-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  }}
                  crossOrigin="anonymous"
                />

                {/* Cropping Rule of Thirds Grid */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>

                {/* Overlay Preview */}
                {overlayBadge === "gold_border" && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-gold z-10 shadow-[inset_0_0_12px_rgba(212,175,55,0.5)]" />
                )}

                {overlayBadge === "verified" && (
                  <div className="absolute top-3 end-3 pointer-events-none bg-navy/90 border border-emerald-500 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg z-10">
                    <ShieldCheck size={12} />
                    <span>موثق NOORMEXA</span>
                  </div>
                )}

                {overlayBadge === "discount" && (
                  <div className="absolute top-3 start-3 pointer-events-none bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-lg z-10 flex items-center gap-1">
                    <Tag size={12} />
                    <span>{discountBadgeText || "خصم 20%"}</span>
                  </div>
                )}

                {overlayBadge === "express" && (
                  <div className="absolute bottom-3 start-3 pointer-events-none bg-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg z-10 flex items-center gap-1">
                    <span>⚡ شحن فوري NOORMEXA</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-line hover:border-gold rounded-2xl cursor-pointer text-muted hover:text-gold transition-colors"
              >
                <Upload size={36} className="mb-2" />
                <p className="text-xs font-bold">{isAr ? "اضغط لرفع صورة والبدء في المعالجة" : "Click to upload an image"}</p>
                <p className="text-[10px] text-muted mt-1">PNG, JPG, WEBP</p>
              </div>
            )}

            {/* Quick Floating Transform Bar */}
            {imageSrc && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 bg-surface/90 backdrop-blur-md p-1.5 rounded-2xl border border-line">
                <button
                  type="button"
                  onClick={handleSmartAutoCrop}
                  className="px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold text-xs font-black flex items-center gap-1 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>{isAr ? "قص ذكي تلقائي 🪄" : "Smart Auto-Crop"}</span>
                </button>

                <div className="w-px h-5 bg-line" />

                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title={isAr ? "تدوير 90 درجة" : "Rotate 90deg"}
                  className="p-1.5 rounded-lg hover:bg-surface-soft text-foreground text-xs"
                >
                  <RotateCw size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  title={isAr ? "تكبير" : "Zoom in"}
                  className="p-1.5 rounded-lg hover:bg-surface-soft text-foreground text-xs"
                >
                  <ZoomIn size={15} />
                </button>

                <button
                  type="button"
                  onClick={resetTransform}
                  title={isAr ? "إعادة ضبط" : "Reset"}
                  className="p-1.5 rounded-lg hover:bg-surface-soft text-rose-500 text-xs"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Right Control Sidebar */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-line bg-surface p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[480px] lg:max-h-none">
            <div className="space-y-4">
              {/* Tabs Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-surface-soft p-1 rounded-2xl border border-line text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("crop")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "crop" ? "bg-surface shadow-xs text-gold" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Crop size={14} />
                  <span>{isAr ? "القص" : "Crop"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "adjust" ? "bg-surface shadow-xs text-gold" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Sliders size={14} />
                  <span>{isAr ? "الفلاتر" : "Adjust"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overlay")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "overlay" ? "bg-surface shadow-xs text-gold" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Layers size={14} />
                  <span>{isAr ? "الشارات" : "Overlays"}</span>
                </button>
              </div>

              {/* TAB 1: Aspect Ratio Presets */}
              {activeTab === "crop" && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-gold" />
                    <span>{isAr ? "نسبة الأبعاد والمقاس المخصص:" : "Aspect Ratio Preset:"}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9")}
                      className={`p-3 rounded-2xl border text-start transition-all ${
                        aspectRatio === "16:9"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      <div className="font-mono text-xs font-black">16 : 9</div>
                      <div className="text-[10px] text-muted mt-0.5">{isAr ? "بانر ومنشورات" : "Banner & Posts"}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("1:1")}
                      className={`p-3 rounded-2xl border text-start transition-all ${
                        aspectRatio === "1:1"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      <div className="font-mono text-xs font-black">1 : 1</div>
                      <div className="text-[10px] text-muted mt-0.5">{isAr ? "منتجات وشعارات" : "Products & Logo"}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("12:5")}
                      className={`p-3 rounded-2xl border text-start transition-all ${
                        aspectRatio === "12:5"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      <div className="font-mono text-xs font-black">12 : 5</div>
                      <div className="text-[10px] text-muted mt-0.5">{isAr ? "غلاف المتجر الرئيسي" : "Store Header"}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("4:5")}
                      className={`p-3 rounded-2xl border text-start transition-all ${
                        aspectRatio === "4:5"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      <div className="font-mono text-xs font-black">4 : 5</div>
                      <div className="text-[10px] text-muted mt-0.5">{isAr ? "عمودي سوشيال" : "Social Portrait"}</div>
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>{isAr ? "التقريب (Zoom)" : "Zoom"}</span>
                      <span className="font-mono text-gold">{zoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-soft border border-line text-[11px] text-muted flex items-start gap-2">
                    <Move size={14} className="text-gold shrink-0 mt-0.5" />
                    <span>
                      {isAr
                        ? "يمكنك سحب وتحريك الصورة بإصبعك أو الماوس لضبط موضع التركيز بدقة."
                        : "Drag the image inside the frame to adjust the focal center."}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: Color Enhancements */}
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        <Sun size={13} className="text-amber-500" />
                        <span>{isAr ? "السطوع والإضاءة" : "Brightness"}</span>
                      </span>
                      <span className="font-mono text-muted">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        <Contrast size={13} className="text-indigo-400" />
                        <span>{isAr ? "التباين والحدة" : "Contrast"}</span>
                      </span>
                      <span className="font-mono text-muted">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        <Palette size={13} className="text-rose-500" />
                        <span>{isAr ? "تشبع الألوان" : "Saturation"}</span>
                      </span>
                      <span className="font-mono text-muted">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBrightness(108);
                        setContrast(115);
                        setSaturation(120);
                      }}
                      className="flex-1 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/30 text-gold text-xs font-bold transition-colors"
                    >
                      {isAr ? "✨ تحسين فاخر للمنتج" : "✨ Luxury Product"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                      }}
                      className="px-3 py-2 rounded-xl bg-surface-soft border border-line text-muted hover:text-foreground text-xs font-bold"
                    >
                      {isAr ? "إعادة" : "Reset"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Overlay Badges */}
              {activeTab === "overlay" && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-foreground">
                    {isAr ? "دمج شارة ترويجية أو توثيق:" : "Overlay Badges & Seals:"}
                  </label>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOverlayBadge("none")}
                      className={`p-2.5 rounded-xl border text-start transition-all ${
                        overlayBadge === "none"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      {isAr ? "بدون شارة (أصلي)" : "No Overlay"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverlayBadge("verified")}
                      className={`p-2.5 rounded-xl border text-start transition-all ${
                        overlayBadge === "verified"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-emerald-500/50"
                      }`}
                    >
                      {isAr ? "✔ شارة التوثيق" : "✔ Verified Seal"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverlayBadge("gold_border")}
                      className={`p-2.5 rounded-xl border text-start transition-all ${
                        overlayBadge === "gold_border"
                          ? "border-gold bg-gold/10 text-gold font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-gold/50"
                      }`}
                    >
                      {isAr ? "👑 إطار ذهبي فاخر" : "👑 Gold Frame"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverlayBadge("discount")}
                      className={`p-2.5 rounded-xl border text-start transition-all ${
                        overlayBadge === "discount"
                          ? "border-rose-500 bg-rose-500/10 text-rose-500 font-bold"
                          : "border-line bg-surface-soft text-foreground hover:border-rose-500/50"
                      }`}
                    >
                      {isAr ? "🏷️ شارة خصم أحمر" : "🏷️ Discount Ribbon"}
                    </button>
                  </div>

                  {overlayBadge === "discount" && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-foreground">{isAr ? "نص شارة الخصم:" : "Ribbon Text:"}</label>
                      <input
                        type="text"
                        value={discountBadgeText}
                        onChange={(e) => setDiscountBadgeText(e.target.value)}
                        placeholder="خصم 20%"
                        className="w-full p-2.5 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none focus:border-gold"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-line flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-line text-muted hover:text-foreground text-xs font-bold transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={generateCroppedImage}
                disabled={!imageSrc}
                className="px-6 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <Check size={16} />
                <span>{isAr ? "اعتماد وقص الصورة" : "Apply & Crop Image"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
