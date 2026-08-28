import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { LocationProvider } from "@/context/LocationContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import LocationSelectorModal from "@/components/location/LocationSelectorModal";

export const metadata: Metadata = {
  title: "NOORMEXA — التسوق الذكي",
  description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
  manifest: "/manifest.json",
  applicationName: "NOORMEXA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NOORMEXA — التسوق الذكي",
  },
  openGraph: {
    title: "NOORMEXA — التسوق الذكي",
    description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
    siteName: "NOORMEXA",
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOORMEXA — التسوق الذكي",
    description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2026", sizes: "any" },
      { url: "/favicon.svg?v=2026", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=2026", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png?v=2026", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2026",
    apple: "/apple-touch-icon.png?v=2026",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Adaptive Vector & Multi-Resolution Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="alternate icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="color-scheme" content="light dark" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- محملة عمدًا هنا (مش عبر next/font) عشان اللغة بتتبدل ديناميكيًا فى المتصفح بين عربي/إنجليزي بدون فصل صفحات، فمحتاجين خط Cairo و Montserrat متاحين مع بعض فى نفس الوقت */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwa_prompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwa_prompt = e;
                window.dispatchEvent(new CustomEvent('noormexa-pwa-ready'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <MarketplaceProvider>
                <LocationProvider>
                  <CartProvider>
                    <div className="noormexa-app-shell">
                      <Navbar />
                      {children}
                      <Footer />
                      <AIAssistant />
                      <MobileBottomNav />
                      <PwaInstallPrompt />
                      <LocationSelectorModal />
                    </div>
                  </CartProvider>
                </LocationProvider>
              </MarketplaceProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
