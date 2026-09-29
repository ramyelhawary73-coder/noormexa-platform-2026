import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOORMEXA",
    short_name: "NOORMEXA",
    description: "NOORMEXA — منصة عالمية ذكية للتجارة والتسوق",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07111F",
    theme_color: "#07111F",
    orientation: "any",
    dir: "auto",
    lang: "ar",
    categories: ["shopping", "business", "productivity"],
    icons: [
      {
        src: "/pwa/icon-192?v=master-artwork-1",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512?v=master-artwork-1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-maskable-192?v=master-artwork-1",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/icon-maskable-512?v=master-artwork-1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
