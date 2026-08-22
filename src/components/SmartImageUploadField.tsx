"use client";

import { useState, useRef } from "react";
import { Sparkles, Upload, X, Crop } from "lucide-react";
import SmartImageCropper, { type AspectRatioType } from "./SmartImageCropper";

interface SmartImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: AspectRatioType;
  required?: boolean;
  isAr?: boolean;
  placeholder?: string;
  helperText?: string;
}

export default function SmartImageUploadField({
  label,
  value,
  onChange,
  aspectRatio = "16:9",
  required = false,
  isAr = true,
  placeholder,
  helperText,
}: SmartImageUploadFieldProps) {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
          // Automatically open cropper upon file upload for instant smart fit
          setIsCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
          setIsCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>

        <button
          type="button"
          onClick={() => {
            if (value) {
              setIsCropperOpen(true);
            } else {
              fileInputRef.current?.click();
            }
          }}
          className="text-[11px] font-black text-gold hover:text-gold-strong flex items-center gap-1 bg-gold/10 hover:bg-gold/20 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Sparkles size={12} />
          <span>{isAr ? "استوديو وقص ذكي 🪄" : "Smart Crop Studio"}</span>
        </button>
      </div>

      <div
        className="flex flex-col sm:flex-row items-stretch gap-3 p-3 rounded-2xl bg-surface-soft border border-line hover:border-gold/50 transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Thumbnail Preview & Quick Edit */}
        {value ? (
          <div className="relative group shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black/40 border border-line flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCropperOpen(true)}
                title={isAr ? "قص وتعديل" : "Crop & Edit"}
                className="w-8 h-8 rounded-lg bg-gold text-navy flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <Crop size={15} />
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                title={isAr ? "حذف" : "Remove"}
                className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-line hover:border-gold bg-surface flex flex-col items-center justify-center text-muted hover:text-gold cursor-pointer transition-colors"
          >
            <Upload size={22} className="mb-1" />
            <span className="text-[10px] font-bold text-center px-1">
              {isAr ? "رفع صورة" : "Upload"}
            </span>
          </div>
        )}

        {/* URL Input & Controls */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                placeholder ||
                (isAr
                  ? "أدخل رابط الصورة أو ارفع ملفاً من جهازك..."
                  : "Enter image URL or upload from device...")
              }
              className="w-full p-2.5 rounded-xl bg-surface border border-line text-xs focus:outline-none focus:border-gold font-sans"
            />
            {helperText && <p className="text-[10px] text-muted">{helperText}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-surface border border-line hover:border-gold text-[11px] font-bold text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Upload size={12} className="text-gold" />
              <span>{isAr ? "اختيار من الجهاز" : "Browse File"}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setIsCropperOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/30 text-gold text-[11px] font-black flex items-center gap-1.5 transition-colors"
              >
                <Crop size={12} />
                <span>{isAr ? "قص وتعديل الأبعاد" : "Crop & Resize"}</span>
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePicked}
        />
      </div>

      {/* Embedded Smart Image Cropper Modal */}
      <SmartImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        initialImageUrl={value}
        defaultAspectRatio={aspectRatio}
        title={label}
        isAr={isAr}
        onCropComplete={(croppedUrl) => {
          onChange(croppedUrl);
        }}
      />
    </div>
  );
}
