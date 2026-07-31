import type { Config } from "tailwindcss";

const config: Config = {
  // تفعيل التبديل السلس للوضع الليلي والنهاري عبر حقن الكلاس جذرياً
  darkMode: "class",
  
  // المسارات الهندسية لمراقبة وتطبيق كلاسات تايلوند داخل المشروع
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
