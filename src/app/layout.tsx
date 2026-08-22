import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "AURUM ERP | NOORMEXA Platform",
  description: "AURUM ERP — نظام ومنصة التجارة والأعمال المتكاملة.",
  manifest: "/manifest.json",
  applicationName: "AURUM ERP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AURUM ERP",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
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
                  navigator.serviceWorker.register('/service-worker.js').catch(function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <MarketplaceProvider>
              <CartProvider>
                <div className="noormexa-app-shell">
                  <Navbar />
                  {children}
                  <Footer />
                  <AIAssistant />
                  <MobileBottomNav />
                  <PwaInstallPrompt />
                </div>
              </CartProvider>
            </MarketplaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
