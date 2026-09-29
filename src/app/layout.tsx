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
  title: "NOORMEXA",
  description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
  manifest: "/manifest.webmanifest",
  applicationName: "NOORMEXA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NOORMEXA",
  },
  openGraph: {
    title: "NOORMEXA",
    description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
    siteName: "NOORMEXA",
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOORMEXA",
    description: "NOORMEXA — سوق تجارة إلكترونية عالمي ومنصة تسوق ذكية للمتسوقين والبائعين والمتاجر والمعلنين.",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/brand/noormexa-symbol.webp?v=master-artwork-2", type: "image/webp" },
      { url: "/pwa/icon-192?v=master-artwork-2", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon?v=master-artwork-2", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07111F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Unified NOORMEXA brand assets for browser + installed app */}
        <link rel="icon" type="image/webp" href="/brand/noormexa-symbol.webp?v=master-artwork-2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa/icon-192?v=master-artwork-2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pwa/apple-touch-icon?v=master-artwork-2" />
        <link rel="manifest" href="/manifest.webmanifest" />
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
